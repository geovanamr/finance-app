// ============================================================
// PÁGINA: Dashboard
// ============================================================

import React, { useEffect } from 'react';
import { MonthCarousel } from '../../components/month-carousel/MonthCarousel';
import { SummaryCards } from './components/SummaryCards';
import { CategoryList } from './components/CategoryList';
import { MonthHeader } from './components/MonthHeader';
import { VaultCard } from './components/VaultCard';
import { useUIStore } from '../../store/ui.store';
import { useTransactionStore } from '../../store/transaction.store';
import { useAuthStore } from '../../store/auth.store';
import { useVaultStore } from '../../store/vault.store';
import { getTransactionsByMonth } from '../../services/transaction.service';
import { getSavingsGoalByMonth } from '../../services/savingsGoal.service';
import { getAllSubcategories } from '../../services/subcategory.service';
import { getVaultEntries } from '../../services/vault.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { selectedMonthKey, setSelectedMonthKey } = useUIStore();
  const {
    setTransactions,
    setSubcategories,
    loadingTransactions,
    loadingSubcategories,
    transactions,
  } = useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { setEntries: setVaultEntries } = useVaultStore();

  // Carrega transações e meta ao mudar o mês
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      useTransactionStore.getState().setLoadingTransactions(true);
      try {
        const [txs, goal] = await Promise.all([
          getTransactionsByMonth(user.uid, selectedMonthKey),
          getSavingsGoalByMonth(user.uid, selectedMonthKey),
        ]);
        setTransactions(txs, selectedMonthKey, goal);
      } catch {
        showToast('Erro ao carregar dados do mês.', 'error');
        useTransactionStore.getState().setLoadingTransactions(false);
      }
    };

    load();
  }, [selectedMonthKey, user]);

  // Carrega subcategorias e cofre uma única vez — erros independentes
  useEffect(() => {
    if (!user) return;

    const loadSubs = async () => {
      useTransactionStore.getState().setLoadingSubcategories(true);
      try {
        const subs = await getAllSubcategories(user.uid);
        setSubcategories(subs);
      } catch (err) {
        console.error('Erro ao carregar subcategorias:', err);
        useTransactionStore.getState().setLoadingSubcategories(false);
      }
    };

    const loadVault = async () => {
      try {
        const vaultData = await getVaultEntries(user.uid);
        setVaultEntries(vaultData);
      } catch (err) {
        console.error('Erro ao carregar cofre:', err);
      }
    };

    loadSubs();
    loadVault();
  }, [user]);

  // Meses com dados (para indicador no carrossel)
  const monthsWithData = transactions.length > 0 ? [selectedMonthKey] : [];

  const isLoading = loadingTransactions || loadingSubcategories;

  return (
    <div className={styles.page}>
      <MonthCarousel
        selectedMonthKey={selectedMonthKey}
        onSelect={setSelectedMonthKey}
        monthsWithData={monthsWithData}
      />

      <MonthHeader monthKey={selectedMonthKey} />

      {isLoading ? (
        <div className={styles.loading}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <SummaryCards />
          <VaultCard />
          <CategoryList monthKey={selectedMonthKey} />
        </>
      )}
    </div>
  );
};
