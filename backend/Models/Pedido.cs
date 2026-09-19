namespace StCharlos.Api.Models;

public class Pedido
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public decimal ValorTotal { get; set; }
    public string Status { get; set; } = "Aguardando Pagamento";
    public DateTime DataPedido { get; set; } = DateTime.UtcNow;

    public List<PedidoItem> Itens { get; set; } = new();
}

/// <summary>
/// Item de um pedido. Não existia no projeto original: um Pedido só tinha um
/// ValorTotal solto, sem registrar quais produtos/quantidades foram comprados.
/// Guardamos também o preço no momento da compra, para que uma mudança futura
/// no preço do produto não altere o histórico de pedidos antigos.
/// </summary>
public class PedidoItem
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}
