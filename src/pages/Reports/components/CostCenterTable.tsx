// ============================================================
// COMPONENTE: CostCenterTable — tabela hierárquica de centro de custos
// ============================================================

import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/currency';
import type { CostCenterReport, CostCenterItem } from '../../../types';
import styles from './CostCenterTable.module.css';

interface CostCenterTableProps {
  report: CostCenterReport;
}

export const CostCenterTable: React.FC<CostCenterTableProps> = ({ report }) => {
  return (
    <div className={styles.wrapper}>
      <Section title="💰 Receitas" items={report.income} total={report.totalIncome} type="income" />
      <Section title="📊 Gastos" items={report.expense} total={report.totalExpense} type="expense" />
    </div>
  );
};

// --- Seção (Receitas ou Gastos) ---

interface SectionProps {
  title: string;
  items: CostCenterItem[];
  total: number;
  type: 'income' | 'expense';
}

const Section: React.FC<SectionProps> = ({ title, items, total, type }) => {
  if (items.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={[styles.sectionHeader, styles[type]].join(' ')}>
        <span>{title}</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thCode}>Código</th>
            <th className={styles.thName}>Descrição</th>
            <th className={styles.thTotal}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CategoryRow key={item.code} item={item} type={type} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Linha de categoria (expansível) ---

interface CategoryRowProps {
  item: CostCenterItem;
  type: 'income' | 'expense';
}

const CategoryRow: React.FC<CategoryRowProps> = ({ item, type }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <>
      <tr
        className={[styles.row, styles.level1, hasChildren ? styles.expandable : ''].join(' ')}
        onClick={() => hasChildren && setExpanded((v) => !v)}
      >
        <td className={styles.tdCode}>{item.code}</td>
        <td className={styles.tdName}>
          {hasChildren && (
            <span className={styles.toggle}>{expanded ? '▾' : '▸'}</span>
          )}
          {item.name}
        </td>
        <td className={[styles.tdTotal, styles[type]].join(' ')}>
          {formatCurrency(item.total)}
        </td>
      </tr>

      {expanded &&
        item.children?.map((child) => (
          <tr key={child.code} className={[styles.row, styles.level2].join(' ')}>
            <td className={styles.tdCode}>{child.code}</td>
            <td className={styles.tdName}>{child.name}</td>
            <td className={styles.tdTotal}>{formatCurrency(child.total)}</td>
          </tr>
        ))}
    </>
  );
};
