using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using StCharlos.Api.Data;
using StCharlos.Api.Dtos;
using StCharlos.Api.Models;

namespace StCharlos.Api.Endpoints;

public static class PedidoEndpoints
{
    public static void MapPedidoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pedidos").WithTags("Pedidos").RequireAuthorization();

        // Antes: GET /api/pedidos/{usuarioId} — qualquer pessoa logada podia trocar
        // o {usuarioId} na URL e ver os pedidos de outra pessoa. Agora o usuário
        // vem do token JWT, nunca da URL.
        group.MapGet("/", async (AppDbContext db, ClaimsPrincipal user) =>
        {
            var usuarioId = ObterUsuarioId(user);

            var pedidos = await db.Pedidos
                .Where(p => p.UsuarioId == usuarioId)
                .OrderByDescending(p => p.DataPedido)
                .Include(p => p.Itens)
                .ThenInclude(i => i.Produto)
                .ToListAsync();

            var resposta = pedidos.Select(p => new PedidoResponse(
                p.Id, p.ValorTotal, p.Status, p.DataPedido,
                p.Itens.Select(i => new ItemPedidoResponse(
                    i.ProdutoId, i.Produto?.Nome ?? "Produto removido", i.Quantidade, i.PrecoUnitario
                )).ToList()
            ));

            return Results.Ok(resposta);
        });

        // Antes: POST /api/pedidos recebia um objeto Pedido pronto do cliente,
        // incluindo ValorTotal — ou seja, o próprio cliente dizia quanto ia pagar.
        // Agora o servidor busca o preço real de cada produto e calcula o total.
        group.MapPost("/", async (AppDbContext db, ClaimsPrincipal user, CriarPedidoRequest req) =>
        {
            var usuarioId = ObterUsuarioId(user);
            var produtoIds = req.Itens.Select(i => i.ProdutoId).ToList();

            var produtos = await db.Produtos.Where(p => produtoIds.Contains(p.Id)).ToListAsync();
            if (produtos.Count != produtoIds.Distinct().Count())
                return Results.BadRequest(new { mensagem = "Um ou mais produtos não existem." });

            var itensPedido = new List<PedidoItem>();
            decimal total = 0;

            foreach (var itemReq in req.Itens)
            {
                var produto = produtos.First(p => p.Id == itemReq.ProdutoId);

                if (produto.EstoqueQuantidade < itemReq.Quantidade)
                    return Results.BadRequest(new { mensagem = $"Estoque insuficiente para '{produto.Nome}'." });

                produto.EstoqueQuantidade -= itemReq.Quantidade;
                total += produto.Preco * itemReq.Quantidade;

                itensPedido.Add(new PedidoItem
                {
                    ProdutoId = produto.Id,
                    Quantidade = itemReq.Quantidade,
                    PrecoUnitario = produto.Preco,
                });
            }

            var pedido = new Pedido
            {
                UsuarioId = usuarioId,
                ValorTotal = total,
                Itens = itensPedido,
            };

            db.Pedidos.Add(pedido);
            await db.SaveChangesAsync();

            return Results.Created($"/api/pedidos/{pedido.Id}", new PedidoResponse(
                pedido.Id, pedido.ValorTotal, pedido.Status, pedido.DataPedido,
                itensPedido.Select(i => new ItemPedidoResponse(
                    i.ProdutoId, produtos.First(p => p.Id == i.ProdutoId).Nome, i.Quantidade, i.PrecoUnitario
                )).ToList()
            ));
        });
    }

    private static int ObterUsuarioId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return int.Parse(sub ?? throw new UnauthorizedAccessException("Token sem identificador de usuário."));
    }
}
