// ============================================================
// STORE DE TRANSAÇÕES, SUBCATEGORIAS E METAS
// ============================================================

import { create } from 'zustand';
import type { Transaction, Subcategory, SavingsGoal, MonthlySummary } from '../types';
import { calcSavingsProgress } from '../utils/reports';
import { roundCurrency } from '../utils/currency';

interface TransactionState {
  // Dados
  transactions: Transaction[];
  subcategories: Subcategory[];
  currentGoal: SavingsGoal | null;

  // Estado de carregamento
  loadingTransactions: boolean;
  loadingSubcategories: boolean;

  // Resumo calculado do mês atual
  monthlySummary: MonthlySummary | null;

  // Setters
  setTransactions: (transactions: Transaction[], monthKey: string, goal: SavingsGoal | null) => void;
  setSubcategories: (subcategories: Subcategory[]) => void;
  setCurrentGoal: (goal: SavingsGoal | null) => void;
  setLoadingTransactions: (loading: boolean) => void;
  setLoadingSubcategories: (loading: boolean) => void;

  // Mutações otimistas (atualizam o estado local sem re-fetch)
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addSubcategory: (subcategory: Subcategory) => void;
  removeSubcategory: (id: string) => void;
  reset: () => void;
}

const calcSummary = (
  transactions: Transaction[],
  monthKey: string,
  goal: SavingsGoal | null
): MonthlySummary => {
  const totalIncome = roundCurrency(transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0));

  const totalExpense = roundCurrency(transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0));

  const balance = roundCurrency(totalIncome - totalExpense);
  const savingsGoal = goal?.amount ?? 0;

  return {
    monthKey,
    totalIncome,
    totalExpense,
    balance,
    savingsGoal,
    savingsGoalProgress: calcSavingsProgress(balance, savingsGoal),
  };
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  subcategories: [],
  currentGoal: null,
  loadingTransactions: false,
  loadingSubcategories: false,
  monthlySummary: null,

  setTransactions: (transactions, monthKey, goal) =>
    set({
      transactions,
      currentGoal: goal,
      monthlySummary: calcSummary(transactions, monthKey, goal),
      loadingTransactions: false,
    }),

  setSubcategories: (subcategories) => set({ subcategories, loadingSubcategories: false }),

  setCurrentGoal: (goal) => {
    const { transactions, monthlySummary } = get();
    set({
      currentGoal: goal,
      monthlySummary: monthlySummary
        ? calcSummary(transactions, monthlySummary.monthKey, goal)
        : null,
    });
  },

  setLoadingTransactions: (loading) => set({ loadingTransactions: loading }),
  setLoadingSubcategories: (loading) => set({ loadingSubcategories: loading }),

  addTransaction: (transaction) => {
    const { transactions, monthlySummary, currentGoal } = get();
    if (!monthlySummary || transaction.monthKey !== monthlySummary.monthKey) return;
    const updated = [transaction, ...transactions];
    set({
      transactions: updated,
      monthlySummary: monthlySummary
        ? calcSummary(updated, monthlySummary.monthKey, currentGoal)
        : null,
    });
  },

  updateTransaction: (id, data) => {
    const { transactions, monthlySummary, currentGoal } = get();
    const updated = transactions
      .map((tx) => (tx.id === id ? { ...tx, ...data } : tx))
      .filter((tx) => !monthlySummary || tx.monthKey === monthlySummary.monthKey)
      .sort((a, b) => b.date.localeCompare(a.date));
    set({
      transactions: updated,
      monthlySummary: monthlySummary
        ? calcSummary(updated, monthlySummary.monthKey, currentGoal)
        : null,
    });
  },

  removeTransaction: (id) => {
    const { transactions, monthlySummary, currentGoal } = get();
    const updated = transactions.filter((tx) => tx.id !== id);
    set({
      transactions: updated,
      monthlySummary: monthlySummary
        ? calcSummary(updated, monthlySummary.monthKey, currentGoal)
        : null,
    });
  },

  addSubcategory: (subcategory) =>
    set((state) => ({ subcategories: [...state.subcategories, subcategory] })),

  removeSubcategory: (id) =>
    set((state) => ({
      subcategories: state.subcategories.filter((s) => s.id !== id),
    })),

  reset: () =>
    set({
      transactions: [],
      subcategories: [],
      currentGoal: null,
      loadingTransactions: false,
      loadingSubcategories: false,
      monthlySummary: null,
    }),
}));
