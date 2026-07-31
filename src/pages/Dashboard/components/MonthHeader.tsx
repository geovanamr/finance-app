import React from 'react';
import { formatMonthLabel } from '../../../utils/date';
import { useUIStore } from '../../../store/ui.store';
import { useTransactionStore } from '../../../store/transaction.store';
import { Button } from '../../../components/ui/Button';
import { SavingsGoalModal } from './SavingsGoalModal';
import styles from './MonthHeader.module.css';
import { usePrivacy } from '../../../context/PrivacyContext';
import { useNavigate } from 'react-router-dom';

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
  const { privateCurrency } = usePrivacy();
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.month}>{formatMonthLabel(monthKey)}</h1>
          {monthlySummary?.savingsGoal ? (
            <p className={styles.goal}>
              Saldo desejado: <strong>{privateCurrency(monthlySummary.savingsGoal)}</strong>
            </p>
          ) : (
            <p className={styles.noGoal}>Sem saldo desejado</p>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/categories')}>
            🏷️ Categorias
          </Button>
          <Button variant="ghost" size="sm" onClick={openSavingsGoalModal}>
            🎯 Objetivo
          </Button>
        </div>
      </div>

      {savingsGoalModal && (
        <SavingsGoalModal
          open
          onClose={closeSavingsGoalModal}
          monthKey={monthKey}
        />
      )}
    </>
  );
};
