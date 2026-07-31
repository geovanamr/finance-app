// ============================================================
// COMPONENTE: BottomNav — navegação inferior (mobile)
// ============================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/ui.store';
import { InstallmentModal } from '../../pages/Dashboard/components/InstallmentModal';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Início' },
  { to: '/transactions', icon: '💸', label: 'Lançamentos' },
  { to: '/vault', icon: '🏦', label: 'Cofre' },
  { to: '/reports', icon: '📊', label: 'Relatórios' },
];

export const BottomNav: React.FC = () => {
  const { installmentModal, openInstallmentModal, closeInstallmentModal } = useUIStore();

  return (
    <>
      <nav className={styles.nav} aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')
            }
            aria-label={item.label}
          >
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}

        <button
          className={styles.item}
          onClick={openInstallmentModal}
          aria-label="Parcelar"
        >
          <span className={styles.icon} aria-hidden="true">📅</span>
          <span className={styles.label}>Parcelar</span>
        </button>
      </nav>

      <InstallmentModal open={installmentModal} onClose={closeInstallmentModal} />
    </>
  );
};
