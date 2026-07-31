import type { VaultEntry } from '../types';
import { roundCurrency } from './currency';

/** Calcula o saldo atual do Cofre a partir das movimentações. */
export const calcVaultBalance = (entries: VaultEntry[]): number =>
  roundCurrency(entries.reduce(
    (sum, entry) => entry.type === 'deposit' ? sum + entry.amount : sum - entry.amount,
    0
  ));
