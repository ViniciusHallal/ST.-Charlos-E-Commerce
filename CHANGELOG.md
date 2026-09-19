# O que mudou em relação ao projeto original

## 🔒 Segurança (backend)
- **Senha em texto puro → hash com BCrypt.** O login original fazia
  `u.Senha == login.Senha` direto no banco; um vazamento do banco expunha a
  senha de todo mundo. Agora só o hash é gravado e comparado com
  `BCrypt.Net.BCrypt.Verify`.
- **Qualquer um podia ver pedido de qualquer usuário.** `GET /api/pedidos/{usuarioId}`
  aceitava qualquer ID na URL. Agora o usuário vem do token JWT
  (`GET /api/pedidos`), nunca de um parâmetro que o cliente controla.
- **Preço calculado pelo cliente.** O `POST /api/pedidos` original recebia um
  `Pedido` pronto do front-end, incluindo `ValorTotal` — ou seja, o próprio
  navegador dizia quanto ia pagar. Agora o servidor busca o preço real de
  cada produto no banco e calcula o total.
- **String de conexão com senha hardcoded no código-fonte** (`Password=suasenha`
  dentro do `.cs`, indo pro Git). Agora vem de `appsettings.Development.json`
  (fora do Git) ou variável de ambiente; `appsettings.json` só tem placeholders.
- **CORS `AllowAnyOrigin`/`AllowAnyMethod`/`AllowAnyHeader` liberado geral.**
  Agora configurável por ambiente (`Cors:AllowedOrigins`), com fallback aberto
  só quando nada é configurado (dev local).
- Login não retornava mais o objeto `Usuario` inteiro (incluía a senha) — agora
  usa DTOs que nunca expõem `SenhaHash`.

## 🧩 Funcionalidade que faltava
- **Cadastro de usuário não existia.** O botão "Cadastre-se" era um link morto
  (`href="#"`). Agora tem página, formulário e endpoint `POST /api/auth/registrar`
  reais, com validação de e-mail duplicado.
- **Pedido não guardava os itens comprados.** O modelo `Pedido` só tinha um
  `ValorTotal` solto, sem nenhuma tabela ligando pedido → produtos. Criado
  `PedidoItem` com produto, quantidade e preço no momento da compra.
- **Controle de estoque inexistente.** Adicionado `EstoqueQuantidade` em
  `Produto`; o backend valida e debita estoque ao fechar um pedido.
- Front-end e back-end **não se conversavam de verdade** — o front era 100%
  estático com dados chumbados no HTML. Agora o front funciona sozinho via
  `localStorage` (para poder ser testado sem infraestrutura) e já vem
  documentado como plugar na API real.

## 🎨 Front-end
- Catálogo de produtos duplicado manualmente entre a Home e "Produtos" →
  centralizado em `js/data.js`, fonte única.
- Carrinho agora permite **aumentar/diminuir quantidade e remover item**
  (antes só dava pra adicionar, sem tirar nada).
- Carrinho e sessão de login **persistem entre recarregamentos** (localStorage);
  antes tudo sumia ao dar F5.
- **Menu não era responsivo** — em telas pequenas os links simplesmente
  quebravam o layout. Adicionado menu hambúrguer para mobile.
- **Busca de produtos** adicionada na página de catálogo.
- `alert()` do JavaScript trocado por **toasts** não-bloqueantes.
- Formatação de moeda manual (`toFixed(2).replace('.', ',')`) trocada por
  `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, que
  trata corretamente milhares (ex.: R$ 1.234,56).
- HTML/CSS/JS separados em arquivos próprios (antes tudo num único
  `index.html` de 270 linhas com `<style>` e `<script>` inline).
- Pequenas melhorias de acessibilidade: elementos clicáveis viraram
  `<button>` reais (antes eram `<span onclick>`, não navegáveis por teclado
  nem por leitor de tela), `aria-label` em ícones, `<nav>` semântico.

## 🗄️ Estrutura do backend
- Não existia nem `.csproj` — o `program.cs` sozinho não compilava. Agora é
  um projeto ASP.NET Core (.NET 8) completo e organizado em pastas
  (`Models/`, `Data/`, `Dtos/`, `Endpoints/`, `Services/`) em vez de tudo
  empilhado em um arquivo só.
- Adicionado Swagger para testar a API pelo navegador em desenvolvimento.
- Modelo `Carrinho` (que existia mas não tinha nenhum endpoint usando ele) foi
  removido — o carrinho agora é responsabilidade do front-end até o momento do
  checkout, quando vira um `Pedido` de verdade. Se no futuro for necessário
  carrinho persistido no servidor (ex.: sincronizar entre dispositivos), dá
  pra reintroduzir como uma tabela própria.

## ⚠️ Nota sobre este ambiente
O backend foi escrito e revisado com cuidado, mas este ambiente não tem o
.NET SDK instalado para compilar/rodar o projeto de fato. Antes de subir para
produção, rode `dotnet build` e os testes localmente.
