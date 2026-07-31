// ============================================================
// COMPONENTE: MobileHeader — header fixo mobile com ThemeToggle
// Visível apenas no mobile (desktop usa TopNav)
// ============================================================

import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PrivacyToggle } from '../ui/PrivacyToggle';
import styles from './MobileHeader.module.css';
import { logOut } from '../../services/auth.service';
import { useToast } from '../ui/Toast';
import { useNavigate } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      showToast('Erro ao sair. Tente novamente.', 'error');
    }
  };

  return (
    <header className={styles.header}>
      <span className={styles.logo}>💰 Finance App</span>
      <div className={styles.actions}>
        <PrivacyToggle />
        <ThemeToggle />
        <button className={styles.iconBtn} onClick={() => navigate('/categories')} aria-label="Categorias">
          🏷️
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Sair">
          Sair
        </button>
      </div>
    </header>
  );
};
