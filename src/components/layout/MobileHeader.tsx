// ============================================================
// COMPONENTE: MobileHeader — header fixo mobile com ThemeToggle
// Visível apenas no mobile (desktop usa TopNav)
// ============================================================

import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PrivacyToggle } from '../ui/PrivacyToggle';
import styles from './MobileHeader.module.css';

export const MobileHeader: React.FC = () => (
  <header className={styles.header}>
    <span className={styles.logo}>💰 Finance App</span>
    <div className={styles.actions}>
      <PrivacyToggle />
      <ThemeToggle />
    </div>
  </header>
);
