// ============================================================
// PÁGINA: Transactions — lista de lançamentos do mês
// ============================================================

import React, { useEffect } from 'react';
import { MonthCarousel } from '../../components/month-carousel/MonthCarousel';
import { useUIStore } from '../../store/ui.store';
import { useTransactionStore } from '../../store/transaction.store';
import { useAuthStore } from '../../store/auth.store';
import { getTransactionsByMonth } from '../../services/transaction.service';
import { getSavingsGoalByMonth } from '../../services/savingsGoal.service';
import { getCategoryById } from '../../config/categories';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import styles from './Transactions.module.css';

export const Transactions: React.FC = () => {
  const { selectedMonthKey, setSelectedMonthKey } = useUIStore();
  const { transactions, subcategories, setTransactions, loadingTransactions } =
    useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

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
        showToast('Erro ao carregar lançamentos.', 'error');
        useTransactionStore.getState().setLoadingTransactions(false);
      }
    };
    load();
  }, [selectedMonthKey, user]);

  const getSubName = (categoryId: string, subId?: string) => {
    if (!subId) return null;
    return subcategories.find((s) => s.id === subId && s.categoryId === categoryId)?.name ?? null;
  };

  const incomeList = transactions.filter((tx) => tx.type === 'income');
  const expenseList = transactions.filter((tx) => tx.type === 'expense');

  const renderList = (list: typeof transactions, type: 'income' | 'expense') => {
    if (list.length === 0) {
      return <p className={styles.empty}>Nenhum lançamento.</p>;
    }
    return (
      <div className={styles.list}>
        {list.map((tx) => {
          const category = getCategoryById(tx.categoryId);
          const subName = getSubName(tx.categoryId, tx.subcategoryId);
          return (
            <div key={tx.id} className={styles.txItem}>
              <span className={styles.txIcon}>{category?.icon ?? '💰'}</span>
              <div className={styles.txInfo}>
                <span className={styles.txDesc}>{tx.description}</span>
                <span className={styles.txMeta}>
                  {category?.name}
                  {subName ? ` › ${subName}` : ''}
                  {' · '}
                  {formatDate(tx.date)}
                </span>
                {tx.observation && (
                  <span className={styles.txObs}>{tx.observation}</span>
                )}
              </div>
              <span
                className={[
                  styles.txAmount,
                  type === 'income' ? styles.income : styles.expense,
                ].join(' ')}
              >
                {type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <MonthCarousel
        selectedMonthKey={selectedMonthKey}
        onSelect={setSelectedMonthKey}
      />

      {loadingTransactions ? (
        <div className={styles.loading}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={[styles.sectionTitle, styles.income].join(' ')}>
              💰 Receitas ({incomeList.length})
            </h2>
            {renderList(incomeList, 'income')}
          </section>

          <section className={styles.section}>
            <h2 className={[styles.sectionTitle, styles.expense].join(' ')}>
              📊 Gastos ({expenseList.length})
            </h2>
            {renderList(expenseList, 'expense')}
          </section>
        </>
      )}
    </div>
  );
};
