import { describe, expect, it } from 'vitest';
import type { Category, Subcategory, Transaction } from '../types';
import { buildCostCenterReport, calcSavingsProgress } from './reports';

const transaction = (overrides: Partial<Transaction>): Transaction => ({
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

const categories: Category[] = [{
  id: 'food',
  name: 'Alimentação',
  type: 'expense',
  icon: '🍽️',
  color: '#e74c3c',
  order: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
}];

describe('buildCostCenterReport', () => {
  it('mantém transações de subcategorias removidas no detalhamento', () => {
    const transactions = [transaction({ subcategoryId: 'removed-subcategory' })];
    const report = buildCostCenterReport(
      transactions,
      [],
      categories,
      '2026-07',
      '2026-07'
    );

    expect(report.totalExpense).toBe(10);
    expect(report.expense[0].children?.[0].total).toBe(10);
    expect(report.expense[0].children?.[0].name).toContain('removida');
  });

  it('agrupa uma subcategoria existente', () => {
    const subcategories: Subcategory[] = [{
      id: 'market',
      categoryId: 'food',
      name: 'Mercado',
      createdAt: '2026-01-01T00:00:00.000Z',
    }];
    const report = buildCostCenterReport(
      [transaction({ subcategoryId: 'market', amount: 25.5 })],
      subcategories,
      categories,
      '2026-07',
      '2026-07'
    );

    expect(report.expense[0].children?.[0]).toMatchObject({ name: 'Mercado', total: 25.5 });
  });

  it('separa os gastos pagos com o Cofre sem removê-los do total', () => {
    const report = buildCostCenterReport(
      [
        transaction({ id: 'vault', amount: 80, paymentSource: 'vault' }),
        transaction({ id: 'month', amount: 20 }),
      ],
      [],
      categories,
      '2026-07',
      '2026-07'
    );

    expect(report.totalExpense).toBe(100);
    expect(report.totalVaultExpense).toBe(80);
  });
});

describe('calcSavingsProgress', () => {
  it('limita o resultado entre zero e cem', () => {
    expect(calcSavingsProgress(-50, 100)).toBe(0);
    expect(calcSavingsProgress(150, 100)).toBe(100);
  });
});
