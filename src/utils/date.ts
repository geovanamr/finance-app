// ============================================================
// UTILITÁRIOS DE DATA
// ============================================================

import { CAROUSEL_MONTHS_RANGE } from '../config/constants';

/**
 * Retorna o monthKey do mês atual no formato "YYYY-MM".
 */
export const getCurrentMonthKey = (): string => {
  const now = new Date();
  return toMonthKey(now);
};

/**
 * Converte uma Date para monthKey "YYYY-MM".
 */
export const toMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Converte monthKey "YYYY-MM" para objeto Date (dia 1).
 */
export const monthKeyToDate = (monthKey: string): Date => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

/**
 * Formata monthKey para exibição amigável.
 * Ex: "2026-05" → "Maio 2026"
 */
export const formatMonthLabel = (monthKey: string): string => {
  const date = monthKeyToDate(monthKey);
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Formata monthKey para exibição curta no carrossel.
 * Ex: "2026-05" → { month: "Mai", year: "26" }
 */
export const formatMonthShort = (monthKey: string): string => {
  const date = monthKeyToDate(monthKey);
  const month = date.toLocaleDateString('pt-BR', { month: 'short' });
  const year = date.toLocaleDateString('pt-BR', { year: '2-digit' });
  const monthClean = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '');
  return `${monthClean}|${year}`;
};

/**
 * Avança ou retrocede um monthKey por N meses.
 * Ex: addMonths("2026-05", -1) → "2026-04"
 */
export const addMonths = (monthKey: string, delta: number): string => {
  const date = monthKeyToDate(monthKey);
  date.setMonth(date.getMonth() + delta);
  return toMonthKey(date);
};

/**
 * Gera lista de monthKeys para o carrossel,
 * centrado no mês atual com CAROUSEL_MONTHS_RANGE para cada lado.
 */
export const generateCarouselMonths = (centerMonthKey: string): string[] => {
  const months: string[] = [];
  for (let i = -CAROUSEL_MONTHS_RANGE; i <= CAROUSEL_MONTHS_RANGE; i++) {
    months.push(addMonths(centerMonthKey, i));
  }
  return months;
};

/**
 * Formata uma data ISO para exibição dd/MM/yyyy.
 */
export const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Retorna o monthKey de uma data ISO "YYYY-MM-DD".
 */
export const dateToMonthKey = (isoDate: string): string => isoDate.slice(0, 7);

/**
 * Compara dois monthKeys. Retorna -1, 0 ou 1.
 */
export const compareMonthKeys = (a: string, b: string): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
