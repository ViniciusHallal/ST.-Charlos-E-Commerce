using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StCharlos.Api.Data;
using StCharlos.Api.Endpoints;
using StCharlos.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- Banco de dados ----------
// A string de conexão agora vem de configuração (appsettings.Development.json,
// variável de ambiente ou user-secrets) em vez de estar escrita direto no código.
var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:Default não configurada. Copie appsettings.Development.json.example " +
        "para appsettings.Development.json e preencha com os dados do seu Postgres."
    );
}
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// ---------- Autenticação JWT ----------
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("Jwt:Key não configurada. Veja appsettings.Development.json.example.");
}

builder.Services.AddSingleton<JwtTokenService>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });
builder.Services.AddAuthorization();

// ---------- CORS ----------
// O original usava AllowAnyOrigin + AllowAnyHeader + AllowAnyMethod, o que é
// perigoso em produção (qualquer site poderia chamar a API autenticada). Agora
// a lista de origens permitidas vem de configuração.
var origensPermitidas = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
    {
        if (origensPermitidas.Length > 0)
            policy.WithOrigins(origensPermitidas).AllowAnyHeader().AllowAnyMethod();
        else
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod(); // só cai aqui em dev sem config
    })
);

// ---------- Swagger (documentação/teste interativo da API) ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapProdutoEndpoints();
app.MapPedidoEndpoints();

app.Run();
