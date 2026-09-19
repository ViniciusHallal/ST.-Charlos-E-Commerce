using System.ComponentModel.DataAnnotations;

namespace StCharlos.Api.Dtos;

public record ProdutoResponse(
    int Id,
    string Nome,
    string Descricao,
    decimal Preco,
    string Tipo,
    bool RequerReceita,
    int EstoqueQuantidade,
    string? ImagemUrl
);

public record ItemPedidoRequest(
    [Required] int ProdutoId,
    [Range(1, 100)] int Quantidade
);

public record CriarPedidoRequest(
    [Required, MinLength(1)] List<ItemPedidoRequest> Itens
);

public record ItemPedidoResponse(int ProdutoId, string Nome, int Quantidade, decimal PrecoUnitario);

public record PedidoResponse(
    int Id,
    decimal ValorTotal,
    string Status,
    DateTime DataPedido,
    List<ItemPedidoResponse> Itens
);
