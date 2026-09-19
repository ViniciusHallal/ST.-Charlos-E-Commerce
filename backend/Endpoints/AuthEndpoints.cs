using Microsoft.EntityFrameworkCore;
using StCharlos.Api.Data;
using StCharlos.Api.Dtos;
using StCharlos.Api.Models;
using StCharlos.Api.Services;

namespace StCharlos.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Autenticação");

        group.MapPost("/registrar", async (AppDbContext db, RegistroRequest req) =>
        {
            var emailNormalizado = req.Email.Trim().ToLowerInvariant();

            var jaExiste = await db.Usuarios.AnyAsync(u => u.Email == emailNormalizado);
            if (jaExiste)
                return Results.Conflict(new { mensagem = "Já existe uma conta com esse e-mail." });

            var usuario = new Usuario
            {
                Nome = req.Nome.Trim(),
                Email = emailNormalizado,
                // Nunca gravar a senha em texto puro — o projeto original fazia
                // "u.Senha == login.Senha" direto no banco.
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(req.Senha),
                Cpf = req.Cpf,
                Telefone = req.Telefone,
            };

            db.Usuarios.Add(usuario);
            await db.SaveChangesAsync();

            return Results.Created($"/api/usuarios/{usuario.Id}", new { usuario.Id, usuario.Nome, usuario.Email });
        });

        group.MapPost("/login", async (AppDbContext db, JwtTokenService jwt, LoginRequest req) =>
        {
            var emailNormalizado = req.Email.Trim().ToLowerInvariant();
            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == emailNormalizado);

            // Verifica o hash com BCrypt em vez de comparar strings diretamente.
            if (usuario is null || !BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
                return Results.Unauthorized();

            var token = jwt.GerarToken(usuario);
            return Results.Ok(new LoginResponse(token, usuario.Nome, usuario.Email));
        });
    }
}
