// ============================================================
// STORE DE UI
// Controla estado global de interface (mês selecionado, modais, etc.)
// ============================================================

import { create } from 'zustand';
import { getCurrentMonthKey } from '../utils/date';

interface UIState {
  // Mês selecionado no carrossel
  selectedMonthKey: string;
  setSelectedMonthKey: (monthKey: string) => void;

  // Modal de nova transação
  transactionModal: {
    open: boolean;
    categoryId: string | null;
    editingId: string | null;
  };
  openTransactionModal: (categoryId: string, editingId?: string) => void;
  closeTransactionModal: () => void;

  // Modal de nova subcategoria
  subcategoryModal: {
    open: boolean;
    categoryId: string | null;
  };
  openSubcategoryModal: (categoryId: string) => void;
  closeSubcategoryModal: () => void;

  // Modal de meta de economia
  savingsGoalModal: boolean;
  openSavingsGoalModal: () => void;
  closeSavingsGoalModal: () => void;

  // Modal de lançamentos futuros (parcelamentos)
  installmentModal: boolean;
  openInstallmentModal: () => void;
  closeInstallmentModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedMonthKey: getCurrentMonthKey(),
  setSelectedMonthKey: (monthKey) => set({ selectedMonthKey: monthKey }),

  transactionModal: { open: false, categoryId: null, editingId: null },
  openTransactionModal: (categoryId, editingId = undefined) =>
    set({ transactionModal: { open: true, categoryId, editingId: editingId ?? null } }),
  closeTransactionModal: () =>
    set({ transactionModal: { open: false, categoryId: null, editingId: null } }),

  subcategoryModal: { open: false, categoryId: null },
  openSubcategoryModal: (categoryId) =>
    set({ subcategoryModal: { open: true, categoryId } }),
  closeSubcategoryModal: () =>
    set({ subcategoryModal: { open: false, categoryId: null } }),

  savingsGoalModal: false,
  openSavingsGoalModal: () => set({ savingsGoalModal: true }),
  closeSavingsGoalModal: () => set({ savingsGoalModal: false }),

  installmentModal: false,
  openInstallmentModal: () => set({ installmentModal: true }),
  closeInstallmentModal: () => set({ installmentModal: false }),
}));
