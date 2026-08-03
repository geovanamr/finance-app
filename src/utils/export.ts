// ============================================================
// UTILITÁRIOS DE EXPORTAÇÃO (PDF e XLSX)
// ============================================================

import type {
  Category,
  CostCenterReport,
  CostCenterItem,
  Subcategory,
} from '../types';
import { formatCurrency } from './currency';
import { formatDate } from './date';

// --- PDF ---

/**
 * Exporta o relatório de centro de custos como PDF.
 */
interface AutoTableDocument {
  lastAutoTable: { finalY: number };
}

export const exportReportToPDF = async (
  report: CostCenterReport,
  title: string
): Promise<void> => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
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
      ['Gastos pagos com o Cofre', formatCurrency(report.totalVaultExpense)],
      ['Saldo', formatCurrency(report.balance)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80] },
    columnStyles: { 1: { halign: 'right' } },
  });

  yPos = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;

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

    yPos = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
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
export const exportReportToXLSX = async (
  report: CostCenterReport,
  title: string,
  categories: Category[],
  subcategories: Subcategory[]
): Promise<void> => {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Aba de resumo
  const summaryData = [
    ['Resumo Financeiro'],
    ['Período', `${report.period.from} a ${report.period.to}`],
    [],
    ['Total de Receitas', report.totalIncome],
    ['Total de Gastos', report.totalExpense],
    ['Gastos pagos com o Cofre', report.totalVaultExpense],
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
  const txData = [
    ['Data', 'Tipo', 'Origem', 'Categoria', 'Subcategoria', 'Descrição', 'Observação', 'Valor'],
    ...buildTransactionExportRows(report, categories, subcategories),
  ];
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transações');

  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
};

/** Monta as linhas detalhadas do Excel usando nomes legíveis, não IDs internos. */
export const buildTransactionExportRows = (
  report: CostCenterReport,
  categories: Category[],
  subcategories: Subcategory[]
): Array<Array<string | number>> => {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const subcategoryNames = new Map(
    subcategories.map((subcategory) => [subcategory.id, subcategory.name])
  );
  const allTransactions = [
    ...report.income.flatMap((item) => item.transactions),
    ...report.expense.flatMap((item) => item.transactions),
  ];

  return allTransactions.map((transaction) => [
    formatDate(transaction.date),
    transaction.type === 'income' ? 'Receita' : 'Gasto',
    transaction.type === 'income'
      ? ''
      : transaction.paymentSource === 'vault'
        ? 'Cofre'
        : 'Saldo do mês',
    categoryNames.get(transaction.categoryId) ?? 'Categoria removida',
    transaction.subcategoryId
      ? subcategoryNames.get(transaction.subcategoryId) ?? 'Subcategoria removida'
      : '',
    transaction.description,
    transaction.observation ?? '',
    transaction.amount,
  ]);
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
