// ============================================================
// UTILITÁRIOS DE FORMATAÇÃO DE MOEDA
// ============================================================

import { CURRENCY_CODE, CURRENCY_LOCALE } from '../config/constants';

/**
 * Formata um número como moeda brasileira.
 * Ex: 1500.5 → "R$ 1.500,50"
 */
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(value);

/**
 * Converte string de input para número.
 * Aceita formatos: "1.500,50" | "1500.50" | "1500,50"
 */
export const parseCurrencyInput = (value: string): number => {
  const cleaned = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formata número para exibição em input (sem símbolo).
 * Ex: 1500.5 → "1.500,50"
 */
export const formatCurrencyInput = (value: number): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
