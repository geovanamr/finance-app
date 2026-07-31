import { describe, expect, it } from 'vitest';
import type {
  Category,
  CostCenterReport,
  Subcategory,
  Transaction,
} from '../types';
import { buildTransactionExportRows } from './export';

const transaction: Transaction = {
  id: 'tx-1',
  categoryId: 'food',
  subcategoryId: 'market',
  description: 'Compra do mês',
  observation: 'Teste',
  amount: 120.5,
  date: '2026-07-10',
  type: 'expense',
  monthKey: '2026-07',
  createdAt: '2026-07-10T12:00:00.000Z',
};

const category: Category = {
  id: 'food',
  name: 'Alimentação',
  type: 'expense',
  icon: '🍽️',
  color: '#e74c3c',
  order: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const subcategory: Subcategory = {
  id: 'market',
  categoryId: 'food',
  name: 'Mercado',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const report: CostCenterReport = {
  period: { from: '2026-07', to: '2026-07' },
  income: [],
  expense: [{
    level: 1,
    code: '1',
    name: 'Alimentação',
    total: transaction.amount,
    transactions: [transaction],
  }],
  totalIncome: 0,
  totalExpense: transaction.amount,
  balance: -transaction.amount,
};

describe('buildTransactionExportRows', () => {
  it('exporta nomes legíveis de categoria e subcategoria', () => {
    const rows = buildTransactionExportRows(report, [category], [subcategory]);

    expect(rows[0]).toEqual([
      '10/07/2026',
      'Gasto',
      'Alimentação',
      'Mercado',
      'Compra do mês',
      'Teste',
      120.5,
    ]);
  });

  it('identifica referências removidas sem expor IDs internos', () => {
    const rows = buildTransactionExportRows(report, [], []);

    expect(rows[0]?.[2]).toBe('Categoria removida');
    expect(rows[0]?.[3]).toBe('Subcategoria removida');
  });
});
