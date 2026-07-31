// ============================================================
// CONTEXTO DE PRIVACIDADE — oculta/exibe valores monetários
// ============================================================

import React, { createContext, useContext, useState } from 'react';
import { formatCurrency } from '../utils/currency';

interface PrivacyContextValue {
  hidden: boolean;
  toggleHidden: () => void;
  /** Retorna o valor formatado ou '••••••' se oculto */
  privateCurrency: (value: number) => string;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hidden, setHidden] = useState<boolean>(() => {
    return localStorage.getItem('valuesHidden') === 'true';
  });

  const toggleHidden = () => {
    setHidden(v => {
      localStorage.setItem('valuesHidden', String(!v));
      return !v;
    });
  };

  const privateCurrency = (value: number): string =>
    hidden ? '••••••' : formatCurrency(value);

  return (
    <PrivacyContext.Provider value={{ hidden, toggleHidden, privateCurrency }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextValue => {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy deve ser usado dentro de PrivacyProvider');
  return ctx;
};
