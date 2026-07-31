// ============================================================
// COMPONENTE: AppShell — estrutura base de layout autenticado
// ============================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import styles from './AppShell.module.css';

export const AppShell: React.FC = () => (
  <div className={styles.shell}>
    <TopNav />
    <MobileHeader />
    <main className={styles.main}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </main>
    <BottomNav />
  </div>
);
