// ============================================================
// COMPONENTE: SummaryCards — cards de resumo financeiro
// ============================================================

import React from 'react';
import { useTransactionStore } from '../../../store/transaction.store';
import { usePrivacy } from '../../../context/PrivacyContext';
import styles from './SummaryCards.module.css';

export const SummaryCards: React.FC = () => {
  const { monthlySummary } = useTransactionStore();
  const { privateCurrency } = usePrivacy();

  const cards = [
    {
      label: 'Receitas',
      icon: '📈',
      value: monthlySummary?.totalIncome ?? 0,
      colorClass: styles.income,
    },
    {
      label: 'Gastos',
      icon: '📉',
      value: monthlySummary?.totalExpense ?? 0,
      colorClass: styles.expense,
    },
    {
      label: 'Saldo',
      icon: '💵',
      value: monthlySummary?.balance ?? 0,
      colorClass:
        (monthlySummary?.balance ?? 0) >= 0 ? styles.income : styles.expense,
    },
    {
      label: 'Meta',
      icon: '🎯',
      value: monthlySummary?.savingsGoal ?? 0,
      colorClass: styles.goal,
      extra:
        monthlySummary?.savingsGoal
          ? `${monthlySummary.savingsGoalProgress}% atingido`
          : 'Não definida',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>{card.icon}</span>
            <span className={styles.label}>{card.label}</span>
          </div>
          <div className={[styles.value, card.colorClass].join(' ')}>
            {privateCurrency(card.value)}
          </div>
          {card.extra && <div className={styles.extra}>{card.extra}</div>}
        </div>
      ))}
    </div>
  );
};
