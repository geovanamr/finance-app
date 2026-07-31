// ============================================================
// COMPONENTE: MonthCarousel
// Navegação de mês no estilo "rodada de campeonato":
// ← | MÊS ANO | →
// ============================================================

import React from 'react';
import { formatMonthLabel, addMonths } from '../../utils/date';
import { MonthPicker } from './MonthPicker';
import styles from './MonthCarousel.module.css';

interface MonthCarouselProps {
  selectedMonthKey: string;
  onSelect: (monthKey: string) => void;
  monthsWithData?: string[];
}

export const MonthCarousel: React.FC<MonthCarouselProps> = ({
  selectedMonthKey,
  onSelect,
  monthsWithData = [],
}) => {
  const prevMonth = addMonths(selectedMonthKey, -1);
  const nextMonth = addMonths(selectedMonthKey, 1);
  const hasData = monthsWithData.includes(selectedMonthKey);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.arrow}
        onClick={() => onSelect(prevMonth)}
        aria-label="Mês anterior"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className={styles.center}>
        <span className={styles.label}>
          {formatMonthLabel(selectedMonthKey)}
        </span>
        <MonthPicker selectedMonthKey={selectedMonthKey} onSelect={onSelect} />
        {hasData && <span className={styles.dot} aria-hidden="true" />}
      </div>

      <button
        className={styles.arrow}
        onClick={() => onSelect(nextMonth)}
        aria-label="Próximo mês"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};
