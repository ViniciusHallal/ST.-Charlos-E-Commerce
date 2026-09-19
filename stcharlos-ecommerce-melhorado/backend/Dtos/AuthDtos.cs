using System.ComponentModel.DataAnnotations;

namespace StCharlos.Api.Dtos;

public record RegistroRequest(
    [Required, MinLength(3)] string Nome,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Senha,
    string? Cpf,
    string? Telefone
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Senha
);

public record LoginResponse(string Token, string Nome, string Email);
