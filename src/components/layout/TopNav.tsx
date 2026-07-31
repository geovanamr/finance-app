// ============================================================
// COMPONENTE: TopNav — navegação superior (desktop)
// ============================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { logOut } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { useToast } from '../ui/Toast';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PrivacyToggle } from '../ui/PrivacyToggle';
import styles from './TopNav.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: '🏠 Início' },
  { to: '/transactions', label: '💸 Lançamentos' },
  { to: '/vault', label: '🏦 Cofre' },
  { to: '/reports', label: '📊 Relatórios' },
];

export const TopNav: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      showToast('Erro ao sair. Tente novamente.', 'error');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>💰 Finance App</span>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.user}>
          <span className={styles.email}>{user?.email}</span>
          <PrivacyToggle />
          <ThemeToggle />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};
