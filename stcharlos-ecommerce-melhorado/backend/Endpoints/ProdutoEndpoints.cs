using Microsoft.EntityFrameworkCore;
using StCharlos.Api.Data;
using StCharlos.Api.Dtos;

namespace StCharlos.Api.Endpoints;

public static class ProdutoEndpoints
{
    public static void MapProdutoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/produtos").WithTags("Produtos");

        group.MapGet("/", async (AppDbContext db) =>
            await db.Produtos
                .Select(p => new ProdutoResponse(p.Id, p.Nome, p.Descricao, p.Preco, p.Tipo, p.RequerReceita, p.EstoqueQuantidade, p.ImagemUrl))
                .ToListAsync()
        );

        group.MapGet("/{id:int}", async (AppDbContext db, int id) =>
        {
            var produto = await db.Produtos.FindAsync(id);
            if (produto is null) return Results.NotFound();

            return Results.Ok(new ProdutoResponse(
                produto.Id, produto.Nome, produto.Descricao, produto.Preco,
                produto.Tipo, produto.RequerReceita, produto.EstoqueQuantidade, produto.ImagemUrl
            ));
        });
    }
}
