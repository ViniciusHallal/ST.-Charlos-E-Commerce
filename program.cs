using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);

// Configuração do PostgreSQL
var connectionString = "Host=localhost;Database=stcharlos;Username=postgres;Password=suasenha";
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors("AllowAll");

// Endpoints de Produtos
app.MapGet("/api/produtos", async (AppDbContext db) => await db.Produtos.ToListAsync());

// Endpoints de Pedidos
app.MapGet("/api/pedidos/{usuarioId}", async (AppDbContext db, int usuarioId) => 
    await db.Pedidos.Where(p => p.UsuarioId == usuarioId).ToListAsync());

app.MapPost("/api/pedidos", async (AppDbContext db, Pedido novoPedido) =>
{
    db.Pedidos.Add(novoPedido);
    await db.SaveChangesAsync();
    return Results.Created($"/api/pedidos/{novoPedido.Id}", novoPedido);
});

// Endpoint Mock de Login
app.MapPost("/api/login", async (AppDbContext db, Usuario login) => 
{
    var user = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == login.Email && u.Senha == login.Senha);
    return user != null ? Results.Ok(user) : Results.Unauthorized();
});

app.Run();

// ==========================================
// Modelos (Espelhando o Banco de Dados)
// ==========================================
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Carrinho> Carrinhos { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
}

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public string Tipo { get; set; } = string.Empty; // 'Medicamento' ou 'Cosmetico'
}

public class Carrinho
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; } = 1;
}

public class Pedido
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public decimal ValorTotal { get; set; }
    public string Status { get; set; } = "Aguardando Pagamento";
    public DateTime DataPedido { get; set; } = DateTime.UtcNow;
}