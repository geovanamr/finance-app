import { describe, expect, it } from 'vitest';
import {
  calcFirstInstallmentDate,
  distributeInstallmentAmounts,
} from './installments';

describe('calcFirstInstallmentDate', () => {
  it('avança para o próximo mês', () => {
    expect(calcFirstInstallmentDate('2026-07-31')).toBe('2026-08-01');
  });

  it('avança o ano em dezembro', () => {
    expect(calcFirstInstallmentDate('2026-12-15')).toBe('2027-01-01');
  });
});

describe('distributeInstallmentAmounts', () => {
  it('distribui centavos sem alterar o total', () => {
    const amounts = distributeInstallmentAmounts(100, 3);
    expect(amounts).toEqual([33.34, 33.33, 33.33]);
    expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBeCloseTo(100, 2);
  });

  it('rejeita parcelas menores que um centavo', () => {
    expect(() => distributeInstallmentAmounts(1, 101)).toThrow();
  });
});
