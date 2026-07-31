// ============================================================
// COMPONENTE: ReportCharts — gráficos do relatório
// ============================================================

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../../utils/currency';
import type { CostCenterReport } from '../../../types';
import styles from './ReportCharts.module.css';

interface ReportChartsProps {
  report: CostCenterReport;
}

// Paleta de cores para o gráfico de pizza
const PIE_COLORS = [
  '#667eea', '#764ba2', '#27ae60', '#e74c3c',
  '#f39c12', '#3498db', '#9b59b6', '#1abc9c',
  '#e67e22', '#2ecc71', '#e91e63', '#00bcd4',
];

export const ReportCharts: React.FC<ReportChartsProps> = ({ report }) => {
  // Dados para o gráfico de pizza de gastos por categoria
  const expensePieData = report.expense.map((item) => ({
    name: item.name,
    value: item.total,
  }));

  // Dados para o gráfico de barras receitas vs gastos
  const barData = [
    { name: 'Receitas', value: report.totalIncome, fill: '#27ae60' },
    { name: 'Gastos', value: report.totalExpense, fill: '#e74c3c' },
    { name: 'Saldo', value: Math.abs(report.balance), fill: report.balance >= 0 ? '#3498db' : '#e67e22' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any) => {
    if (typeof value === 'number') return formatCurrency(value);
    return String(value);
  };

  return (
    <div className={styles.wrapper}>
      {/* Gráfico de barras — resumo */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Resumo do período</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de pizza — gastos por categoria */}
      {expensePieData.length > 0 && (
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Gastos por categoria</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={expensePieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {expensePieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
