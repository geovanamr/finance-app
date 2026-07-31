import { beforeEach, describe, expect, it } from 'vitest';
import type { Transaction } from '../types';
import { useTransactionStore } from './transaction.store';

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-1',
  categoryId: 'food',
  description: 'Compra',
  amount: 10,
  date: '2026-07-10',
  type: 'expense',
  monthKey: '2026-07',
  createdAt: '2026-07-10T12:00:00.000Z',
  ...overrides,
});

describe('transaction store month isolation', () => {
  beforeEach(() => {
    useTransactionStore.getState().reset();
    useTransactionStore.getState().setTransactions([], '2026-07', null);
  });

  it('ignora no estado uma transação criada para outro mês', () => {
    useTransactionStore.getState().addTransaction(
      transaction({ id: 'future', date: '2026-08-01', monthKey: '2026-08' })
    );

    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  it('adiciona e recalcula uma transação do mês aberto', () => {
    useTransactionStore.getState().addTransaction(transaction());

    expect(useTransactionStore.getState().transactions).toHaveLength(1);
    expect(useTransactionStore.getState().monthlySummary?.totalExpense).toBe(10);
  });

  it('remove da visão atual uma transação movida para outro mês', () => {
    useTransactionStore.getState().addTransaction(transaction());
    useTransactionStore.getState().updateTransaction('tx-1', {
      date: '2026-08-01',
      monthKey: '2026-08',
    });

    expect(useTransactionStore.getState().transactions).toHaveLength(0);
    expect(useTransactionStore.getState().monthlySummary?.totalExpense).toBe(0);
  });
});
