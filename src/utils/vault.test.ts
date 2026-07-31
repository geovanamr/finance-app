import { describe, expect, it } from 'vitest';
import type { VaultEntry } from '../types';
import { calcVaultBalance } from './vault';

const entry = (overrides: Partial<VaultEntry>): VaultEntry => ({
  id: 'entry-1',
  type: 'deposit',
  amount: 100,
  date: '2026-07-01',
  description: 'Reserva',
  createdAt: '2026-07-01T12:00:00.000Z',
  ...overrides,
});

describe('calcVaultBalance', () => {
  it('soma depósitos e subtrai retiradas', () => {
    expect(calcVaultBalance([
      entry({ amount: 150 }),
      entry({ id: 'entry-2', type: 'withdraw', amount: 40 }),
    ])).toBe(110);
  });

  it('arredonda o saldo para centavos', () => {
    expect(calcVaultBalance([
      entry({ amount: 0.1 }),
      entry({ id: 'entry-2', amount: 0.2 }),
    ])).toBe(0.3);
  });
});
