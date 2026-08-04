import { create } from 'zustand';
import type { AccountProfile } from '../types';

interface MasterState {
  accounts: AccountProfile[];
  selectedAccountUid: string | null;
  loading: boolean;
  setAccounts: (accounts: AccountProfile[]) => void;
  setSelectedAccountUid: (uid: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useMasterStore = create<MasterState>((set) => ({
  accounts: [],
  selectedAccountUid: null,
  loading: false,
  setAccounts: (accounts) => set({ accounts, loading: false }),
  setSelectedAccountUid: (selectedAccountUid) => set({ selectedAccountUid }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ accounts: [], selectedAccountUid: null, loading: false }),
}));
