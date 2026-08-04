// ============================================================
// APP — roteamento principal e inicialização do Firebase Auth
// ============================================================

import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from './services/auth.service';
import { useAuthStore } from './store/auth.store';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useTransactionStore } from './store/transaction.store';
import { useVaultStore } from './store/vault.store';
import { useUIStore } from './store/ui.store';
import { useCategoryStore } from './store/category.store';
import { useMasterStore } from './store/master.store';

const Login = lazy(() => import('./pages/LoginV2/LoginV2').then((module) => ({ default: module.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard').then((module) => ({ default: module.Dashboard })));
const Transactions = lazy(() => import('./pages/Transactions/Transactions').then((module) => ({ default: module.Transactions })));
const Reports = lazy(() => import('./pages/Reports/Reports').then((module) => ({ default: module.Reports })));
const Vault = lazy(() => import('./pages/Vault/Vault').then((module) => ({ default: module.Vault })));
const Categories = lazy(() => import('./pages/Categories/Categories').then((module) => ({ default: module.Categories })));

const App: React.FC = () => {
  const { user, loading, setUser } = useAuthStore();

  // Observa o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthChange((nextUser) => {
      const previousUser = useAuthStore.getState().user;
      if (previousUser?.uid !== nextUser?.uid) {
        useTransactionStore.getState().reset();
        useVaultStore.getState().reset();
        useUIStore.getState().reset();
        useCategoryStore.getState().reset();
        useMasterStore.getState().reset();
      }
      setUser(nextUser);
    });
    return unsubscribe;
  }, [setUser]);

  // Aguarda o Firebase confirmar o estado de auth antes de renderizar
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ThemeProvider>
      <PrivacyProvider>
        <ToastProvider>
        <HashRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Rota pública */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {/* Rotas protegidas */}
          {user ? (
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/vault" element={<Vault />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
        </Suspense>
      </HashRouter>
        </ToastProvider>
      </PrivacyProvider>
    </ThemeProvider>
  );
};

export default App;
