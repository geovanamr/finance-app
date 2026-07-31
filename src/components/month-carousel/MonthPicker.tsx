// ============================================================
// COMPONENTE: MonthPicker
// Seletor de mês/ano em popover — abre ao clicar no mês atual
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { monthKeyToDate, toMonthKey } from '../../utils/date';
import styles from './MonthPicker.module.css';

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

interface MonthPickerProps {
  selectedMonthKey: string;
  onSelect: (monthKey: string) => void;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ selectedMonthKey, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selectedDate = monthKeyToDate(selectedMonthKey);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedMonth = selectedDate.getMonth();
  const selectedYear  = selectedDate.getFullYear();

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Fecha com Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Sincroniza o ano do picker com o mês selecionado ao abrir
  const handleOpen = () => {
    setPickerYear(selectedDate.getFullYear());
    setOpen(v => !v);
  };

  const handleSelect = (monthIndex: number) => {
    const date = new Date(pickerYear, monthIndex, 1);
    onSelect(toMonthKey(date));
    setOpen(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.trigger}
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Selecionar mês"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      </button>

      {open && (
        <div className={styles.popover} role="dialog" aria-label="Selecionar mês e ano">
          {/* Navegação de ano */}
          <div className={styles.yearNav}>
            <button
              className={styles.yearBtn}
              onClick={() => setPickerYear(y => y - 1)}
              aria-label="Ano anterior"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <span className={styles.yearLabel}>
              {pickerYear}
              {pickerYear === currentYear && <span className={styles.currentBadge}>atual</span>}
            </span>

            <button
              className={styles.yearBtn}
              onClick={() => setPickerYear(y => y + 1)}
              aria-label="Próximo ano"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Grade de meses */}
          <div className={styles.grid}>
            {MONTHS.map((name, index) => {
              const isSelected = index === selectedMonth && pickerYear === selectedYear;
              const isCurrentMonth = index === new Date().getMonth() && pickerYear === currentYear;

              return (
                <button
                  key={index}
                  className={[
                    styles.monthBtn,
                    isSelected ? styles.selected : '',
                    isCurrentMonth && !isSelected ? styles.current : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect(index)}
                  aria-label={`${name} ${pickerYear}`}
                  aria-pressed={isSelected}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
