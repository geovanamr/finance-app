import { describe, expect, it } from 'vitest';
import { parseCurrencyInput, roundCurrency } from './currency';

describe('parseCurrencyInput', () => {
  it.each([
    ['1.500,50', 1500.5],
    ['R$ 1.500,50', 1500.5],
    ['1500,50', 1500.5],
    ['1500.50', 1500.5],
    ['1.500', 1500],
    ['10', 10],
    ['texto', 0],
  ])('converte %s para %s', (input, expected) => {
    expect(parseCurrencyInput(input)).toBe(expected);
  });
});

describe('roundCurrency', () => {
  it('evita resíduos comuns de ponto flutuante', () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });
});
