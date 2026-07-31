// ============================================================
// UTILITÁRIOS DE EXPORTAÇÃO (PDF e XLSX)
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { CostCenterReport, CostCenterItem } from '../types';
import { formatCurrency } from './currency';
import { formatDate } from './date';

// --- PDF ---

/**
 * Exporta o relatório de centro de custos como PDF.
 */
export const exportReportToPDF = (report: CostCenterReport, title: string): void => {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text(title, 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(127, 140, 141);
  doc.text(
    `Período: ${report.period.from} a ${report.period.to}`,
    14,
    28
  );

  let yPos = 38;

  // Resumo
  autoTable(doc, {
    startY: yPos,
    head: [['Resumo', 'Valor']],
    body: [
      ['Total de Receitas', formatCurrency(report.totalIncome)],
      ['Total de Gastos', formatCurrency(report.totalExpense)],
      ['Saldo', formatCurrency(report.balance)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80] },
    columnStyles: { 1: { halign: 'right' } },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Receitas
  const incomeRows = flattenCostCenterItems(report.income);
  if (incomeRows.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(39, 174, 96);
    doc.text('RECEITAS', 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Descrição', 'Total']],
      body: incomeRows.map((item) => [
        item.code,
        '  '.repeat(item.level - 1) + item.name,
        formatCurrency(item.total),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
      columnStyles: { 2: { halign: 'right' } },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Gastos
  const expenseRows = flattenCostCenterItems(report.expense);
  if (expenseRows.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(231, 76, 60);
    doc.text('GASTOS', 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Descrição', 'Total']],
      body: expenseRows.map((item) => [
        item.code,
        '  '.repeat(item.level - 1) + item.name,
        formatCurrency(item.total),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] },
      columnStyles: { 2: { halign: 'right' } },
    });
  }

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

// --- XLSX ---

/**
 * Exporta o relatório de centro de custos como XLSX.
 */
export const exportReportToXLSX = (report: CostCenterReport, title: string): void => {
  const wb = XLSX.utils.book_new();

  // Aba de resumo
  const summaryData = [
    ['Resumo Financeiro'],
    ['Período', `${report.period.from} a ${report.period.to}`],
    [],
    ['Total de Receitas', report.totalIncome],
    ['Total de Gastos', report.totalExpense],
    ['Saldo', report.balance],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Aba de receitas
  const incomeRows = flattenCostCenterItems(report.income);
  const incomeData = [
    ['Código', 'Descrição', 'Total'],
    ...incomeRows.map((item) => [item.code, item.name, item.total]),
  ];
  const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Receitas');

  // Aba de gastos
  const expenseRows = flattenCostCenterItems(report.expense);
  const expenseData = [
    ['Código', 'Descrição', 'Total'],
    ...expenseRows.map((item) => [item.code, item.name, item.total]),
  ];
  const wsExpense = XLSX.utils.aoa_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, wsExpense, 'Gastos');

  // Aba de transações detalhadas
  const allTransactions = [
    ...report.income.flatMap((i) => i.transactions),
    ...report.expense.flatMap((e) => e.transactions),
  ];
  const txData = [
    ['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Descrição', 'Observação', 'Valor'],
    ...allTransactions.map((tx) => [
      formatDate(tx.date),
      tx.type === 'income' ? 'Receita' : 'Gasto',
      tx.categoryId,
      tx.subcategoryId ?? '',
      tx.description,
      tx.observation ?? '',
      tx.amount,
    ]),
  ];
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transações');

  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
};

// --- Helpers internos ---

/**
 * Achata a árvore de CostCenterItems em lista plana para tabelas.
 */
const flattenCostCenterItems = (items: CostCenterItem[]): CostCenterItem[] => {
  const result: CostCenterItem[] = [];
  const flatten = (list: CostCenterItem[]) => {
    list.forEach((item) => {
      result.push(item);
      if (item.children?.length) flatten(item.children);
    });
  };
  flatten(items);
  return result;
};
