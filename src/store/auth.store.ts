// ============================================================
// STORE DE AUTENTICAÇÃO
// ============================================================

import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, // inicia true até o Firebase confirmar o estado
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
