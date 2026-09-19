/**
 * Catálogo de produtos.
 * No projeto original, os produtos estavam copiados manualmente dentro do HTML
 * (uma vez na Home, outra em "Todos os Produtos"), então editar um preço exigia
 * mudar em dois lugares. Aqui existe uma única fonte de verdade.
 *
 * Quando o back-end (pasta /backend) estiver rodando, basta trocar esta função
 * por um fetch('/api/produtos') — o resto do app.js já foi escrito para lidar
 * com uma Promise, então a migração é direta.
 */
const PRODUTOS = [
  { id: 1, nome: 'Vitamina C 1g', tipo: 'Medicamento', preco: 15.9, destaque: true, receita: false },
  { id: 2, nome: 'Sérum Anti-idade', tipo: 'Cosmetico', preco: 120.0, destaque: true, receita: false },
  { id: 3, nome: 'Dipirona Sódica 500mg', tipo: 'Medicamento', preco: 8.5, destaque: false, receita: false },
  { id: 4, nome: 'Amoxicilina 500mg', tipo: 'Medicamento', preco: 45.0, destaque: false, receita: true },
  { id: 5, nome: 'Paracetamol 750mg', tipo: 'Medicamento', preco: 6.9, destaque: false, receita: false },
  { id: 6, nome: 'Ibuprofeno 400mg', tipo: 'Medicamento', preco: 12.5, destaque: false, receita: false },
  { id: 7, nome: 'Protetor Solar FPS 70', tipo: 'Cosmetico', preco: 89.9, destaque: false, receita: false },
  { id: 8, nome: 'Hidratante Corporal 400ml', tipo: 'Cosmetico', preco: 35.9, destaque: false, receita: false },
  { id: 9, nome: 'Shampoo Anticaspa', tipo: 'Cosmetico', preco: 28.5, destaque: false, receita: false },
  { id: 10, nome: 'Protetor Labial FPS 30', tipo: 'Cosmetico', preco: 14.9, destaque: false, receita: false },
];

function getProdutoPorId(id) {
  return PRODUTOS.find((p) => p.id === id) || null;
}

function getDestaques() {
  return PRODUTOS.filter((p) => p.destaque);
}

function getTipos() {
  return [...new Set(PRODUTOS.map((p) => p.tipo))];
}
