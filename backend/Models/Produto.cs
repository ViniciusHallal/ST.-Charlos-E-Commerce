namespace StCharlos.Api.Models;

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }

    /// <summary>"Medicamento" ou "Cosmetico".</summary>
    public string Tipo { get; set; } = string.Empty;

    public bool RequerReceita { get; set; }
    public int EstoqueQuantidade { get; set; }
    public string? ImagemUrl { get; set; }
}
