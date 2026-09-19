'use strict';

/* =========================================================================
   CONFIGURAÇÃO E ESTADO
   Tudo é guardado em localStorage para que o site funcione sozinho, sem
   precisar do back-end rodando. Quando o back-end (pasta /backend) estiver
   no ar, veja o comentário "INTEGRAÇÃO COM API" mais abaixo.
   ========================================================================= */
const STORAGE_KEYS = {
  cart: 'stcharlos_cart',
  users: 'stcharlos_users',
  session: 'stcharlos_session',
  orders: 'stcharlos_pedidos',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

function formatBRL(value) {
  return currencyFormatter.format(value);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Não foi possível ler "${key}" do localStorage`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Hash simples só para não gravar a senha em texto puro no localStorage do
 * navegador durante essa demo 100% client-side. ISSO NÃO É SEGURANÇA DE
 * VERDADE — no back-end real (pasta /backend) a senha é hasheada com BCrypt
 * no servidor, que é o jeito correto de fazer isso em produção.
 */
function hashDemo(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

let cart = readJSON(STORAGE_KEYS.cart, []); // [{id, quantidade}]

/* =========================================================================
   TOASTS (substituem os alert() do projeto original)
   ========================================================================= */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3200);
}

/* =========================================================================
   NAVEGAÇÃO ENTRE "PÁGINAS"
   ========================================================================= */
const PAGES = ['home', 'produtos', 'pedidos', 'login', 'cadastro'];

function navigate(targetId) {
  PAGES.forEach((page) => {
    document.getElementById('page-' + page).classList.add('hidden');
  });
  document.getElementById('page-' + targetId).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileMenu();

  if (targetId === 'produtos') renderProdutos();
  if (targetId === 'pedidos') renderPedidos();
  if (targetId === 'home') renderDestaques();
  updateAuthUI();
}

/* =========================================================================
   MENU MOBILE
   ========================================================================= */
function toggleMobileMenu() {
  document.getElementById('menu-links').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('menu-links').classList.remove('open');
}

/* =========================================================================
   RENDERIZAÇÃO DE PRODUTOS
   ========================================================================= */
function criarCardProduto(produto) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-tag">${produto.tipo}${produto.receita ? ' • Requer receita' : ''}</div>
    <h3 class="card-title">${produto.nome}</h3>
    <div class="card-price">${formatBRL(produto.preco)}</div>
    <button class="btn-add" type="button" aria-label="Adicionar ${produto.nome} ao carrinho">Adicionar</button>
  `;
  card.querySelector('.btn-add').addEventListener('click', () => addToCart(produto.id));
  return card;
}

function renderDestaques() {
  const container = document.getElementById('grid-destaques');
  container.innerHTML = '';
  getDestaques().forEach((produto) => container.appendChild(criarCardProduto(produto)));
}

function renderProdutos() {
  const termo = document.getElementById('busca-produtos').value.trim().toLowerCase();
  const container = document.getElementById('produtos-por-tipo');
  container.innerHTML = '';

  const tipos = getTipos();
  let algumResultado = false;

  tipos.forEach((tipo) => {
    const produtosDoTipo = PRODUTOS.filter(
      (p) => p.tipo === tipo && p.nome.toLowerCase().includes(termo)
    );
    if (produtosDoTipo.length === 0) return;
    algumResultado = true;

    const titulo = document.createElement('h2');
    titulo.className = 'section-title';
    titulo.style.borderLeftColor = tipo === 'Medicamento' ? 'var(--st-red)' : 'purple';
    titulo.textContent = tipo === 'Medicamento' ? '💊 Medicamentos' : '✨ Cosméticos';
    container.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'grid-produtos';
    produtosDoTipo.forEach((produto) => grid.appendChild(criarCardProduto(produto)));
    container.appendChild(grid);
  });

  if (!algumResultado) {
    container.innerHTML = '<p class="empty-state">Nenhum produto encontrado para essa busca.</p>';
  }
}

/* =========================================================================
   CARRINHO
   ========================================================================= */
function addToCart(produtoId) {
  const item = cart.find((i) => i.id === produtoId);
  if (item) {
    item.quantidade += 1;
  } else {
    cart.push({ id: produtoId, quantidade: 1 });
  }
  persistCart();
  toggleCart(true);
  const produto = getProdutoPorId(produtoId);
  showToast(`${produto.nome} adicionado ao carrinho`, 'success');
}

function changeQuantity(produtoId, delta) {
  const item = cart.find((i) => i.id === produtoId);
  if (!item) return;
  item.quantidade += delta;
  if (item.quantidade <= 0) {
    cart = cart.filter((i) => i.id !== produtoId);
  }
  persistCart();
}

function removeFromCart(produtoId) {
  cart = cart.filter((i) => i.id !== produtoId);
  persistCart();
}

function persistCart() {
  writeJSON(STORAGE_KEYS.cart, cart);
  updateCartUI();
}

function toggleCart(show) {
  const sidebar = document.getElementById('cart-sidebar');
  if (show) sidebar.classList.remove('hidden');
  else sidebar.classList.add('hidden');
}

function cartTotal() {
  return cart.reduce((total, item) => {
    const produto = getProdutoPorId(item.id);
    return produto ? total + produto.preco * item.quantidade : total;
  }, 0);
}

function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const countLabel = document.getElementById('cart-count');
  const priceLabel = document.getElementById('cart-total-price');
  const totalItens = cart.reduce((n, i) => n + i.quantidade, 0);

  countLabel.innerText = totalItens;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-state">O carrinho está vazio.</p>';
    priceLabel.innerText = formatBRL(0);
    return;
  }

  container.innerHTML = '';
  cart.forEach((item) => {
    const produto = getProdutoPorId(item.id);
    if (!produto) return;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <span>${produto.nome}</span>
        <div class="qty-controls" aria-label="Quantidade de ${produto.nome}">
          <button type="button" aria-label="Diminuir quantidade">−</button>
          <span>${item.quantidade}</span>
          <button type="button" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">${formatBRL(produto.preco * item.quantidade)}</span>
        <button type="button" class="btn-remove" aria-label="Remover ${produto.nome} do carrinho">✖</button>
      </div>
    `;
    const [btnMenos, btnMais] = row.querySelectorAll('.qty-controls button');
    btnMenos.addEventListener('click', () => changeQuantity(produto.id, -1));
    btnMais.addEventListener('click', () => changeQuantity(produto.id, 1));
    row.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(produto.id));
    container.appendChild(row);
  });

  priceLabel.innerText = formatBRL(cartTotal());
}

function checkout() {
  if (cart.length === 0) return;
  const usuario = getUsuarioLogado();
  if (!usuario) {
    showToast('Faça login para finalizar a compra', 'error');
    toggleCart(false);
    navigate('login');
    return;
  }

  const pedidos = readJSON(STORAGE_KEYS.orders, []);
  const novoPedido = {
    id: pedidos.length ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1,
    usuarioEmail: usuario.email,
    itens: cart.map((item) => ({
      produtoId: item.id,
      nome: getProdutoPorId(item.id)?.nome ?? 'Produto',
      quantidade: item.quantidade,
      precoUnitario: getProdutoPorId(item.id)?.preco ?? 0,
    })),
    total: cartTotal(),
    status: 'Aguardando Pagamento',
    data: new Date().toISOString(),
  };
  pedidos.unshift(novoPedido);
  writeJSON(STORAGE_KEYS.orders, pedidos);

  cart = [];
  persistCart();
  toggleCart(false);
  showToast('Pedido realizado com sucesso!', 'success');
  navigate('pedidos');
}

/* =========================================================================
   AUTENTICAÇÃO (simulada no navegador — ver aviso no topo do arquivo)
   ========================================================================= */
function getUsuarioLogado() {
  return readJSON(STORAGE_KEYS.session, null);
}

function updateAuthUI() {
  const usuario = getUsuarioLogado();
  const link = document.getElementById('link-conta');
  link.textContent = usuario ? `Olá, ${usuario.nome.split(' ')[0]}` : 'Entrar / Cadastrar';
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;
  const erroEl = document.getElementById('login-erro');

  const usuarios = readJSON(STORAGE_KEYS.users, []);
  const usuario = usuarios.find((u) => u.email === email && u.senhaHash === hashDemo(senha));

  if (!usuario) {
    erroEl.textContent = 'E-mail ou senha inválidos.';
    erroEl.classList.remove('hidden');
    return;
  }

  erroEl.classList.add('hidden');
  writeJSON(STORAGE_KEYS.session, { nome: usuario.nome, email: usuario.email });
  event.target.reset();
  showToast(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}!`, 'success');
  navigate('home');
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  showToast('Você saiu da sua conta.', 'info');
  navigate('home');
}

function handleCadastro(event) {
  event.preventDefault();
  const nome = document.getElementById('cadastro-nome').value.trim();
  const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
  const senha = document.getElementById('cadastro-senha').value;
  const confirmarSenha = document.getElementById('cadastro-confirmar-senha').value;
  const erroEl = document.getElementById('cadastro-erro');

  const erros = [];
  if (nome.length < 3) erros.push('Informe seu nome completo.');
  if (!/^\S+@\S+\.\S+$/.test(email)) erros.push('Informe um e-mail válido.');
  if (senha.length < 6) erros.push('A senha precisa ter pelo menos 6 caracteres.');
  if (senha !== confirmarSenha) erros.push('As senhas não coincidem.');

  const usuarios = readJSON(STORAGE_KEYS.users, []);
  if (usuarios.some((u) => u.email === email)) erros.push('Já existe uma conta com esse e-mail.');

  if (erros.length > 0) {
    erroEl.innerHTML = erros.map((e) => `• ${e}`).join('<br>');
    erroEl.classList.remove('hidden');
    return;
  }

  erroEl.classList.add('hidden');
  usuarios.push({ nome, email, senhaHash: hashDemo(senha) });
  writeJSON(STORAGE_KEYS.users, usuarios);
  writeJSON(STORAGE_KEYS.session, { nome, email });
  event.target.reset();
  showToast('Cadastro realizado com sucesso!', 'success');
  navigate('home');
}

/* =========================================================================
   MEUS PEDIDOS
   ========================================================================= */
function renderPedidos() {
  const container = document.getElementById('pedidos-container');
  const usuario = getUsuarioLogado();

  if (!usuario) {
    container.innerHTML = `
      <p class="empty-state">Faça login para ver seus pedidos.</p>
      <button type="button" class="btn-login" style="max-width:200px;margin:0 auto;display:block;" onclick="navigate('login')">Ir para login</button>
    `;
    return;
  }

  const pedidos = readJSON(STORAGE_KEYS.orders, []).filter((p) => p.usuarioEmail === usuario.email);

  if (pedidos.length === 0) {
    container.innerHTML = '<p class="empty-state">Você ainda não fez nenhum pedido.</p>';
    return;
  }

  container.innerHTML = '';
  pedidos.forEach((pedido) => {
    const card = document.createElement('div');
    card.className = 'pedido-card';
    const statusClasse = pedido.status === 'Entregue' ? 'badge-entregue' : 'badge-pendente';
    card.innerHTML = `
      <div>
        <h3 class="pedido-numero">Pedido #${String(pedido.id).padStart(5, '0')}</h3>
        <p class="pedido-data">Data: ${dateFormatter.format(new Date(pedido.data))}</p>
        <p class="pedido-itens">${pedido.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}</p>
        <p class="pedido-total">Total: ${formatBRL(pedido.total)}</p>
      </div>
      <div><span class="badge-status ${statusClasse}">${pedido.status}</span></div>
    `;
    container.appendChild(card);
  });
}

/* =========================================================================
   INICIALIZAÇÃO
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-cadastro').addEventListener('submit', handleCadastro);
  document.getElementById('busca-produtos').addEventListener('input', renderProdutos);
  document.getElementById('btn-menu-mobile').addEventListener('click', toggleMobileMenu);
  document.getElementById('btn-checkout').addEventListener('click', checkout);

  renderDestaques();
  updateCartUI();
  updateAuthUI();
});

/* =========================================================================
   INTEGRAÇÃO COM API (opcional)
   Quando o back-end em /backend estiver rodando, dá para trocar as funções
   de auth/pedidos acima por chamadas fetch(), por exemplo:
   
   async function handleLogin(event) {
     event.preventDefault();
     const resp = await fetch(`${API_BASE_URL}/api/auth/login`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, senha }),
     });
     if (!resp.ok) { ...mostra erro... ; return; }
     const { token, nome, email } = await resp.json();
     localStorage.setItem('stcharlos_token', token); // usar em Authorization: Bearer
     ...
   }
   ========================================================================= */
