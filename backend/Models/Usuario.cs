namespace StCharlos.Api.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hash da senha gerado com BCrypt. NUNCA guarde a senha em texto puro
    /// (o projeto original comparava "u.Senha == login.Senha" direto no banco,
    /// o que expunha a senha de todo mundo em caso de vazamento do banco).
    /// </summary>
    public string SenhaHash { get; set; } = string.Empty;

    public string? Cpf { get; set; }
    public string? Telefone { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public List<Pedido> Pedidos { get; set; } = new();
}
