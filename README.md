# ST. Charlos E-Commerce

Repositório de um e-commerce de farmácia. Este README documenta a versão
reestruturada do projeto — veja `CHANGELOG.md` para a lista detalhada do que
mudou em relação à versão original.

## Estrutura

```
frontend/           Site (HTML + CSS + JS puro, sem dependências)
  index.html
  css/style.css
  js/data.js         catálogo de produtos (fonte única, sem duplicação)
  js/app.js          navegação, carrinho, login/cadastro, pedidos, toasts

backend/             API em ASP.NET Core (.NET 8) com PostgreSQL
  Program.cs
  Models/            Usuario, Produto, Pedido, PedidoItem
  Data/              AppDbContext (EF Core)
  Dtos/              objetos de entrada/saída da API (nunca expõem a senha)
  Endpoints/         rotas agrupadas por assunto (Auth, Produtos, Pedidos)
  Services/          geração de token JWT
```

## Rodando o front-end

Não precisa de instalação. Abra `frontend/index.html` no navegador, ou sirva
a pasta com qualquer servidor estático, por exemplo:

```bash
cd frontend
python3 -m http.server 5500
```

Hoje o front-end funciona **sozinho**, guardando carrinho, login e pedidos no
`localStorage` do navegador — assim dá pra testar o site completo sem precisar
subir banco de dados nenhum. O comentário "INTEGRAÇÃO COM API" no fim de
`js/app.js` mostra como trocar isso por chamadas reais à API quando quiser.

## Rodando o back-end

Pré-requisitos: .NET 8 SDK e um PostgreSQL rodando localmente (ou em Docker).

```bash
cd backend
cp appsettings.Development.json.example appsettings.Development.json
# edite appsettings.Development.json com sua string de conexão e uma chave JWT própria

dotnet restore
dotnet tool install --global dotnet-ef   # se ainda não tiver
dotnet ef migrations add InitialCreate
dotnet ef database update

dotnet run
```

A API sobe com Swagger em `/swagger` (ambiente Development) para testar os
endpoints direto do navegador.

### Endpoints

| Método | Rota                | Autenticação | Descrição |
|--------|---------------------|:---:|-----------|
| POST   | `/api/auth/registrar` | não | Cria uma conta |
| POST   | `/api/auth/login`     | não | Retorna um token JWT |
| GET    | `/api/produtos`       | não | Lista o catálogo |
| GET    | `/api/produtos/{id}`  | não | Detalhe de um produto |
| GET    | `/api/pedidos`        | sim | Pedidos do usuário logado (extraído do token, não da URL) |
| POST   | `/api/pedidos`        | sim | Cria um pedido; total e estoque calculados no servidor |

Para rotas autenticadas, envie `Authorization: Bearer <token>` recebido no login.

## Licença

MIT — veja `LICENSE`.
