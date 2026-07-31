// ============================================================
// STORE DO COFRE
// ============================================================

import { create } from 'zustand';
import type { VaultEntry } from '../types';
import { calcVaultBalance } from '../services/vault.service';

interface VaultState {
  entries: VaultEntry[];
  balance: number;
  loading: boolean;

  setEntries: (entries: VaultEntry[]) => void;
  setLoading: (loading: boolean) => void;
  addEntry: (entry: VaultEntry) => void;
  removeEntry: (id: string) => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  entries: [],
  balance: 0,
  loading: false,

  setEntries: (entries) =>
    set({ entries, balance: calcVaultBalance(entries), loading: false }),

  setLoading: (loading) => set({ loading }),

  addEntry: (entry) => {
    const entries = [entry, ...get().entries];
    set({ entries, balance: calcVaultBalance(entries) });
  },

  removeEntry: (id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries, balance: calcVaultBalance(entries) });
  },
}));
