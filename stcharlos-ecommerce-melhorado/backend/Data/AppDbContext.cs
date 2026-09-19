using Microsoft.EntityFrameworkCore;
using StCharlos.Api.Models;

namespace StCharlos.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<PedidoItem> PedidoItens => Set<PedidoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Produto>()
            .Property(p => p.Preco)
            .HasColumnType("decimal(10,2)");

        modelBuilder.Entity<Pedido>()
            .Property(p => p.ValorTotal)
            .HasColumnType("decimal(10,2)");

        modelBuilder.Entity<Pedido>()
            .HasMany(p => p.Itens)
            .WithOne()
            .HasForeignKey(i => i.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PedidoItem>()
            .Property(i => i.PrecoUnitario)
            .HasColumnType("decimal(10,2)");

        // Dados iniciais, para não subir o banco vazio.
        modelBuilder.Entity<Produto>().HasData(
            new Produto { Id = 1, Nome = "Vitamina C 1g", Descricao = "Suplemento vitamínico", Preco = 15.90m, Tipo = "Medicamento", RequerReceita = false, EstoqueQuantidade = 100 },
            new Produto { Id = 2, Nome = "Sérum Anti-idade", Descricao = "Cuidado facial", Preco = 120.00m, Tipo = "Cosmetico", RequerReceita = false, EstoqueQuantidade = 50 },
            new Produto { Id = 3, Nome = "Dipirona Sódica 500mg", Descricao = "Analgésico e antitérmico", Preco = 8.50m, Tipo = "Medicamento", RequerReceita = false, EstoqueQuantidade = 200 },
            new Produto { Id = 4, Nome = "Amoxicilina 500mg", Descricao = "Antibiótico", Preco = 45.00m, Tipo = "Medicamento", RequerReceita = true, EstoqueQuantidade = 80 },
            new Produto { Id = 5, Nome = "Protetor Solar FPS 70", Descricao = "Proteção solar facial", Preco = 89.90m, Tipo = "Cosmetico", RequerReceita = false, EstoqueQuantidade = 60 },
            new Produto { Id = 6, Nome = "Hidratante Corporal 400ml", Descricao = "Hidratação diária", Preco = 35.90m, Tipo = "Cosmetico", RequerReceita = false, EstoqueQuantidade = 70 }
        );
    }
}
