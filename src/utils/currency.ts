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
  const cleaned = value.replace(/[^\d,.-]/g, '');
  if (!cleaned) return 0;

  const commaIndex = cleaned.lastIndexOf(',');
  const dotIndex = cleaned.lastIndexOf('.');
  let normalized = cleaned;

  if (commaIndex >= 0 && dotIndex >= 0) {
    const decimalSeparator = commaIndex > dotIndex ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? /\./g : /,/g;
    normalized = cleaned
      .replace(thousandsSeparator, '')
      .replace(decimalSeparator, '.');
  } else if (commaIndex >= 0) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (dotIndex >= 0) {
    const dotCount = (cleaned.match(/\./g) ?? []).length;
    const decimalDigits = cleaned.length - dotIndex - 1;
    normalized = dotCount > 1 || decimalDigits === 3
      ? cleaned.replace(/\./g, '')
      : cleaned;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? roundCurrency(parsed) : 0;
};

/** Arredonda um valor para duas casas decimais. */
export const roundCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Formata número para exibição em input (sem símbolo).
 * Ex: 1500.5 → "1.500,50"
 */
export const formatCurrencyInput = (value: number): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
