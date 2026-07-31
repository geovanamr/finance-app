// ============================================================
// APP — roteamento principal e inicialização do Firebase Auth
// ============================================================

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from './services/auth.service';
import { useAuthStore } from './store/auth.store';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Login } from './pages/LoginV2/LoginV2';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Transactions } from './pages/Transactions/Transactions';
import { Reports } from './pages/Reports/Reports';
import { Vault } from './pages/Vault/Vault';

const App: React.FC = () => {
  const { user, loading, setUser } = useAuthStore();

  // Observa o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
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
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </HashRouter>
        </ToastProvider>
      </PrivacyProvider>
    </ThemeProvider>
  );
};

export default App;
