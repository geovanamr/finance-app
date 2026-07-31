// ============================================================
// UTILITÁRIOS DE GERAÇÃO DE RELATÓRIOS
// ============================================================

import type { Transaction, Subcategory, CostCenterItem, CostCenterReport } from '../types';
import { CATEGORIES } from '../config/categories';

/**
 * Gera o relatório de centro de custos a partir das transações e subcategorias.
 * Estrutura: Categoria (nível 1) → Subcategoria (nível 2)
 */
export const buildCostCenterReport = (
  transactions: Transaction[],
  subcategories: Subcategory[],
  fromMonthKey: string,
  toMonthKey: string
): CostCenterReport => {
  // Filtra transações pelo período
  const filtered = transactions.filter(
    (tx) => tx.monthKey >= fromMonthKey && tx.monthKey <= toMonthKey
  );

  const incomeItems = buildCostCenterItems(
    filtered.filter((tx) => tx.type === 'income'),
    subcategories,
    'income'
  );

  const expenseItems = buildCostCenterItems(
    filtered.filter((tx) => tx.type === 'expense'),
    subcategories,
    'expense'
  );

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.total, 0);
  const totalExpense = expenseItems.reduce((sum, item) => sum + item.total, 0);

  return {
    period: { from: fromMonthKey, to: toMonthKey },
    income: incomeItems,
    expense: expenseItems,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

/**
 * Constrói a árvore de itens de centro de custo para um tipo (income/expense).
 * Numeração: 1, 2, 3... para categorias; 1.1, 1.2... para subcategorias.
 */
const buildCostCenterItems = (
  transactions: Transaction[],
  subcategories: Subcategory[],
  type: 'income' | 'expense'
): CostCenterItem[] => {
  const categories = CATEGORIES.filter((c) => c.type === type);
  const result: CostCenterItem[] = [];
  let categoryIndex = 0;

  categories.forEach((category) => {
    const categoryTxs = transactions.filter((tx) => tx.categoryId === category.id);
    if (categoryTxs.length === 0) return;

    categoryIndex++;
    const categoryCode = String(categoryIndex);

    // Transações diretas na categoria (sem subcategoria)
    const directTxs = categoryTxs.filter((tx) => !tx.subcategoryId);

    // Subcategorias desta categoria que têm transações
    const categorySubs = subcategories.filter((sub) => sub.categoryId === category.id);
    const children: CostCenterItem[] = [];
    let subIndex = 0;

    categorySubs.forEach((sub) => {
      const subTxs = categoryTxs.filter((tx) => tx.subcategoryId === sub.id);
      if (subTxs.length === 0) return;

      subIndex++;
      children.push({
        level: 2,
        code: `${categoryCode}.${subIndex}`,
        name: sub.name,
        total: subTxs.reduce((sum, tx) => sum + tx.amount, 0),
        transactions: subTxs,
      });
    });

    // Se há transações diretas, adiciona como subcategoria "Geral"
    if (directTxs.length > 0) {
      subIndex++;
      children.push({
        level: 2,
        code: `${categoryCode}.${subIndex}`,
        name: 'Geral',
        total: directTxs.reduce((sum, tx) => sum + tx.amount, 0),
        transactions: directTxs,
      });
    }

    const categoryTotal = categoryTxs.reduce((sum, tx) => sum + tx.amount, 0);

    result.push({
      level: 1,
      code: categoryCode,
      name: category.name,
      total: categoryTotal,
      transactions: categoryTxs,
      children,
    });
  });

  return result;
};

/**
 * Calcula o progresso da meta de economia.
 * Retorna percentual de 0 a 100.
 */
export const calcSavingsProgress = (
  balance: number,
  goal: number
): number => {
  if (goal <= 0) return 0;
  return Math.min(Math.round((balance / goal) * 100), 100);
};
