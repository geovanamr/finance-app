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
import { getTransactionsByMonth } from '../../services/transaction.service';
import { getSavingsGoalByMonth } from '../../services/savingsGoal.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import styles from './Dashboard.module.css';
import { useCategoryStore } from '../../store/category.store';

export const Dashboard: React.FC = () => {
  const { selectedMonthKey, setSelectedMonthKey } = useUIStore();
  const {
    setTransactions,
    loadingTransactions,
    loadingSubcategories,
    transactions,
  } = useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const loadingCategories = useCategoryStore((state) => state.loading);

  // Carrega transações e meta ao mudar o mês
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      useTransactionStore.getState().setLoadingTransactions(true);
      try {
        const [txs, goal] = await Promise.all([
          getTransactionsByMonth(user.uid, selectedMonthKey),
          getSavingsGoalByMonth(user.uid, selectedMonthKey),
        ]);
        if (!cancelled) setTransactions(txs, selectedMonthKey, goal);
      } catch {
        if (!cancelled) {
          showToast('Erro ao carregar dados do mês.', 'error');
          useTransactionStore.getState().setLoadingTransactions(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedMonthKey, setTransactions, showToast, user]);

  // Meses com dados (para indicador no carrossel)
  const monthsWithData = transactions.length > 0 ? [selectedMonthKey] : [];

  const isLoading = loadingTransactions || loadingSubcategories || loadingCategories;

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
