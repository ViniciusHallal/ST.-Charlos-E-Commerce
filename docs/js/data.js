/**
 * Catálogo de produtos.
 * Fonte única de verdade — tanto a Home (destaques) quanto a página
 * "Todos os Produtos" leem daqui, então editar um preço ou adicionar um
 * item só precisa ser feito neste arquivo.
 *
 * Quando o back-end (pasta /backend) estiver rodando, basta trocar esta
 * lista por um fetch('/api/produtos') — o resto do app.js já foi escrito
 * para lidar com uma Promise, então a migração é direta.
 */

/**
 * Metadados de cada categoria (ícone, cor de destaque e rótulo em
 * português). Usado tanto no filtro da página de produtos quanto nos
 * cartões e no diretório de categorias da Home.
 */
const CATEGORIAS = {
  Medicamento: { icone: '💊', cor: '#0B3D91', label: 'Medicamentos' },
  Cosmetico: { icone: '✨', cor: '#8A3FFC', label: 'Cosméticos' },
  Higiene: { icone: '🧴', cor: '#12805C', label: 'Higiene Pessoal' },
  Suplemento: { icone: '🌿', cor: '#B4690E', label: 'Suplementos' },
  Infantil: { icone: '🧸', cor: '#D62839', label: 'Infantil' },
  Dermocosmetico: { icone: '🧖', cor: '#0E7C86', label: 'Dermocosmético' },
};

const PRODUTOS = [
  // ---------------------------------------------------------------- Medicamentos
  { id: 1, nome: 'Vitamina C 1g', tipo: 'Medicamento', preco: 15.9, destaque: true, receita: false },
  { id: 3, nome: 'Dipirona Sódica 500mg', tipo: 'Medicamento', preco: 8.5, destaque: false, receita: false },
  { id: 4, nome: 'Amoxicilina 500mg', tipo: 'Medicamento', preco: 45.0, destaque: false, receita: true },
  { id: 5, nome: 'Paracetamol 750mg', tipo: 'Medicamento', preco: 6.9, destaque: false, receita: false },
  { id: 6, nome: 'Ibuprofeno 400mg', tipo: 'Medicamento', preco: 12.5, destaque: false, receita: false },
  { id: 11, nome: 'Omeprazol 20mg', tipo: 'Medicamento', preco: 19.9, destaque: false, receita: false },
  { id: 12, nome: 'Loratadina 10mg', tipo: 'Medicamento', preco: 14.5, destaque: false, receita: false },
  { id: 13, nome: 'Losartana Potássica 50mg', tipo: 'Medicamento', preco: 22.9, destaque: false, receita: true },

  // ------------------------------------------------------------------- Cosméticos
  { id: 2, nome: 'Sérum Anti-idade', tipo: 'Cosmetico', preco: 120.0, destaque: true, receita: false },
  { id: 7, nome: 'Protetor Solar FPS 70', tipo: 'Cosmetico', preco: 89.9, destaque: false, receita: false },
  { id: 8, nome: 'Hidratante Corporal 400ml', tipo: 'Cosmetico', preco: 35.9, destaque: false, receita: false },
  { id: 9, nome: 'Shampoo Anticaspa', tipo: 'Cosmetico', preco: 28.5, destaque: false, receita: false },
  { id: 10, nome: 'Protetor Labial FPS 30', tipo: 'Cosmetico', preco: 14.9, destaque: false, receita: false },
  { id: 14, nome: 'Base Líquida Matte', tipo: 'Cosmetico', preco: 69.9, destaque: false, receita: false },
  { id: 15, nome: 'Máscara Facial de Argila', tipo: 'Cosmetico', preco: 42.9, destaque: true, receita: false },

  // -------------------------------------------------------------- Higiene Pessoal
  { id: 16, nome: 'Escova Dental Macia', tipo: 'Higiene', preco: 9.9, destaque: false, receita: false },
  { id: 17, nome: 'Fio Dental 50m', tipo: 'Higiene', preco: 7.5, destaque: false, receita: false },
  { id: 18, nome: 'Sabonete Líquido Antibacteriano', tipo: 'Higiene', preco: 16.9, destaque: false, receita: false },
  { id: 19, nome: 'Desodorante Roll-on 48h', tipo: 'Higiene', preco: 13.9, destaque: false, receita: false },
  { id: 20, nome: 'Enxaguante Bucal 500ml', tipo: 'Higiene', preco: 21.9, destaque: true, receita: false },

  // ------------------------------------------------------------------ Suplementos
  { id: 21, nome: 'Ômega 3 1000mg (60 cáps)', tipo: 'Suplemento', preco: 54.9, destaque: false, receita: false },
  { id: 22, nome: 'Whey Protein Concentrado 900g', tipo: 'Suplemento', preco: 129.9, destaque: true, receita: false },
  { id: 23, nome: 'Colágeno Hidrolisado 300g', tipo: 'Suplemento', preco: 79.9, destaque: false, receita: false },
  { id: 24, nome: 'Multivitamínico Adulto', tipo: 'Suplemento', preco: 39.9, destaque: false, receita: false },

  // ---------------------------------------------------------------------- Infantil
  { id: 25, nome: 'Fralda Infantil Tamanho M (pacote)', tipo: 'Infantil', preco: 44.9, destaque: false, receita: false },
  { id: 26, nome: 'Vitamina Infantil em Gotas', tipo: 'Infantil', preco: 27.9, destaque: false, receita: false },
  { id: 27, nome: 'Termômetro Digital Infantil', tipo: 'Infantil', preco: 32.9, destaque: false, receita: false },
  { id: 28, nome: 'Pomada para Assaduras 45g', tipo: 'Infantil', preco: 18.5, destaque: false, receita: false },

  // ---------------------------------------------------------------- Dermocosmético
  { id: 29, nome: 'Sabonete Facial Dermocosmético', tipo: 'Dermocosmetico', preco: 38.9, destaque: false, receita: false },
  { id: 30, nome: 'Creme para Cicatrizes 30g', tipo: 'Dermocosmetico', preco: 58.9, destaque: false, receita: false },
  { id: 31, nome: 'Gel Calmante Pós-Sol', tipo: 'Dermocosmetico', preco: 33.9, destaque: true, receita: false },
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

function getCategoriaInfo(tipo) {
  return CATEGORIAS[tipo] || { icone: '🏷️', cor: '#0B3D91', label: tipo };
}

function contarProdutosPorTipo(tipo) {
  return PRODUTOS.filter((p) => p.tipo === tipo).length;
}
