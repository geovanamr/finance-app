// ============================================================
// PÁGINA: Reports — relatório de centro de custos
// ============================================================

import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useTransactionStore } from '../../store/transaction.store';
import { getTransactionsByPeriod } from '../../services/transaction.service';
import { buildCostCenterReport } from '../../utils/reports';
import { exportReportToPDF, exportReportToXLSX } from '../../utils/export';
import { formatCurrency } from '../../utils/currency';
import { getCurrentMonthKey, addMonths } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CostCenterTable } from './components/CostCenterTable';
import { ReportCharts } from './components/ReportCharts';
import { useToast } from '../../components/ui/Toast';
import type { CostCenterReport } from '../../types';
import styles from './Reports.module.css';

export const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { subcategories } = useTransactionStore();
  const { showToast } = useToast();

  const currentMonth = getCurrentMonthKey();

  const [fromMonth, setFromMonth] = useState(addMonths(currentMonth, -2));
  const [toMonth, setToMonth] = useState(currentMonth);
  const [report, setReport] = useState<CostCenterReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    if (fromMonth > toMonth) {
      showToast('O mês inicial deve ser anterior ao mês final.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const transactions = await getTransactionsByPeriod(user.uid, fromMonth, toMonth);
      const generated = buildCostCenterReport(
        transactions,
        subcategories,
        fromMonth,
        toMonth
      );
      setReport(generated);
    } catch {
      showToast('Erro ao gerar relatório.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reportTitle = report
    ? `Relatório_${report.period.from}_a_${report.period.to}`
    : 'Relatório';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Relatórios</h1>
        <p className={styles.subtitle}>Centro de custos por período</p>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>De</label>
          <input
            type="month"
            className={styles.monthInput}
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Até</label>
          <input
            type="month"
            className={styles.monthInput}
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
          />
        </div>
        <Button onClick={handleGenerate} loading={loading}>
          Gerar
        </Button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      {report && !loading && (
        <>
          {/* Resumo */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Receitas</span>
              <span className={[styles.summaryValue, styles.income].join(' ')}>
                {formatCurrency(report.totalIncome)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Gastos</span>
              <span className={[styles.summaryValue, styles.expense].join(' ')}>
                {formatCurrency(report.totalExpense)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Saldo</span>
              <span
                className={[
                  styles.summaryValue,
                  report.balance >= 0 ? styles.income : styles.expense,
                ].join(' ')}
              >
                {formatCurrency(report.balance)}
              </span>
            </div>
          </div>

          {/* Exportação */}
          <div className={styles.exportRow}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportReportToPDF(report, reportTitle)}
            >
              📄 Exportar PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportReportToXLSX(report, reportTitle)}
            >
              📊 Exportar Excel
            </Button>
          </div>

          {/* Gráficos */}
          <ReportCharts report={report} />

          {/* Tabela de centro de custos */}
          <CostCenterTable report={report} />
        </>
      )}

      {!report && !loading && (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>📋</span>
          <p>Selecione o período e clique em <strong>Gerar</strong> para visualizar o relatório.</p>
        </div>
      )}
    </div>
  );
};
