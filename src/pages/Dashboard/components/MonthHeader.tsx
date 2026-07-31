import React from 'react';
import { formatMonthLabel } from '../../../utils/date';
import { useUIStore } from '../../../store/ui.store';
import { useTransactionStore } from '../../../store/transaction.store';
import { Button } from '../../../components/ui/Button';
import { SavingsGoalModal } from './SavingsGoalModal';
import styles from './MonthHeader.module.css';

interface MonthHeaderProps {
  monthKey: string;
}

export const MonthHeader: React.FC<MonthHeaderProps> = ({ monthKey }) => {
  const {
    savingsGoalModal,
    openSavingsGoalModal,
    closeSavingsGoalModal,
  } = useUIStore();
  const { monthlySummary } = useTransactionStore();

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.month}>{formatMonthLabel(monthKey)}</h1>
          {monthlySummary?.savingsGoal ? (
            <p className={styles.goal}>
              Meta: <strong>R$ {monthlySummary.savingsGoal.toFixed(2).replace('.', ',')}</strong>
            </p>
          ) : (
            <p className={styles.noGoal}>Sem meta definida</p>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={openSavingsGoalModal}>
            🎯 Meta
          </Button>
        </div>
      </div>

      <SavingsGoalModal
        open={savingsGoalModal}
        onClose={closeSavingsGoalModal}
        monthKey={monthKey}
      />
    </>
  );
};
