// ============================================================
// CATEGORIAS FIXAS DA APLICAÇÃO
// Para adicionar ou editar categorias, modifique este arquivo.
// ============================================================

import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  // --- RECEITAS ---
  {
    id: 'salary',
    name: 'Salário Principal',
    type: 'income',
    icon: '💼',
    color: '#27ae60',
  },
  {
    id: 'freelance',
    name: 'Freelances',
    type: 'income',
    icon: '💻',
    color: '#2ecc71',
  },
  {
    id: 'investments',
    name: 'Investimentos',
    type: 'income',
    icon: '📈',
    color: '#1abc9c',
  },
  {
    id: 'sales',
    name: 'Vendas',
    type: 'income',
    icon: '🛒',
    color: '#16a085',
  },
  {
    id: 'other_income',
    name: 'Outras Receitas',
    type: 'income',
    icon: '💰',
    color: '#27ae60',
  },

  // --- GASTOS ---
  {
    id: 'housing',
    name: 'Moradia',
    type: 'expense',
    icon: '🏠',
    color: '#e74c3c',
  },
  {
    id: 'electricity',
    name: 'Energia Elétrica',
    type: 'expense',
    icon: '⚡',
    color: '#e67e22',
  },
  {
    id: 'water',
    name: 'Água',
    type: 'expense',
    icon: '💧',
    color: '#3498db',
  },
  {
    id: 'internet',
    name: 'Internet / Telefone',
    type: 'expense',
    icon: '📡',
    color: '#9b59b6',
  },
  {
    id: 'food',
    name: 'Alimentação',
    type: 'expense',
    icon: '🍽️',
    color: '#e74c3c',
  },
  {
    id: 'transport',
    name: 'Transporte',
    type: 'expense',
    icon: '🚗',
    color: '#e67e22',
  },
  {
    id: 'health',
    name: 'Saúde',
    type: 'expense',
    icon: '🏥',
    color: '#e74c3c',
  },
  {
    id: 'education',
    name: 'Educação',
    type: 'expense',
    icon: '📚',
    color: '#8e44ad',
  },
  {
    id: 'leisure',
    name: 'Lazer',
    type: 'expense',
    icon: '🎮',
    color: '#f39c12',
  },
  {
    id: 'clothing',
    name: 'Roupas',
    type: 'expense',
    icon: '👕',
    color: '#e74c3c',
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    type: 'expense',
    icon: '💳',
    color: '#c0392b',
  },
  {
    id: 'loans',
    name: 'Empréstimos',
    type: 'expense',
    icon: '🏦',
    color: '#922b21',
  },
  {
    id: 'insurance',
    name: 'Seguros',
    type: 'expense',
    icon: '🛡️',
    color: '#e67e22',
  },
  {
    id: 'taxes',
    name: 'Impostos',
    type: 'expense',
    icon: '📋',
    color: '#7f8c8d',
  },
  {
    id: 'misc_expense',
    name: 'Gastos Diversos',
    type: 'expense',
    icon: '📦',
    color: '#95a5a6',
  },
];

// Helpers para acesso rápido
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === 'income');
export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense');

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);
