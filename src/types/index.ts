// ============================================================
// TIPOS GLOBAIS DA APLICAÇÃO
// ============================================================

// --- Enums ---

export type TransactionType = 'income' | 'expense';

// --- Categorias ---

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

// --- Subcategorias ---

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  createdAt: string; // ISO 8601
}

// --- Transações ---

export interface Transaction {
  id: string;
  categoryId: string;
  subcategoryId?: string; // opcional — transação pode ser direto na categoria
  description: string;
  amount: number;
  date: string; // ISO 8601 (YYYY-MM-DD)
  observation?: string;
  type: TransactionType;
  monthKey: string; // formato: "YYYY-MM" — facilita queries por mês
  createdAt: string; // ISO 8601
  // Campos de parcelamento (presentes apenas em transações geradas por um plano)
  installmentPlanId?: string; // ID do plano pai
  installmentNumber?: number; // número da parcela (1-based)
  totalInstallments?: number; // total de parcelas do plano
}

// --- Plano de parcelamento ---

export interface InstallmentPlan {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;       // ex: "Celular"
  totalAmount: number;       // valor total da compra
  installmentAmount: number; // valor de cada parcela (pode ser editado)
  totalInstallments: number; // quantidade de parcelas
  purchaseDate: string;      // data da compra (YYYY-MM-DD)
  firstInstallmentDate: string; // sempre dia 01 do mês seguinte à compra
  observation?: string;
  type: TransactionType;
  createdAt: string;
}

export interface InstallmentFormData {
  categoryId: string;
  subcategoryId?: string;
  description: string;
  totalAmount: string;       // string para input, convertido antes de salvar
  installmentAmount: string; // editável pelo usuário
  totalInstallments: string; // número de parcelas
  purchaseDate: string;      // data da compra
  observation?: string;
}

// --- Resumo mensal (calculado no frontend) ---

export interface MonthlySummary {
  monthKey: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsGoal: number;
  savingsGoalProgress: number; // percentual 0-100
}

// --- Meta de economia ---

export interface SavingsGoal {
  id: string;
  monthKey: string;
  amount: number;
}

// --- Cofre ---

export type VaultEntryType = 'deposit' | 'withdraw';

export interface VaultEntry {
  id: string;
  type: VaultEntryType;
  amount: number;
  date: string;        // YYYY-MM-DD
  description: string;
  observation?: string;
  createdAt: string;
}

export interface VaultEntryFormData {
  type: VaultEntryType;
  amount: string;
  date: string;
  description: string;
  observation?: string;
}

// --- Relatório de centro de custos ---

export interface CostCenterItem {
  level: number; // 1 = categoria, 2 = subcategoria
  code: string;  // ex: "1", "1.1", "1.2.1"
  name: string;
  total: number;
  transactions: Transaction[];
  children?: CostCenterItem[];
}

export interface CostCenterReport {
  period: {
    from: string; // YYYY-MM
    to: string;   // YYYY-MM
  };
  income: CostCenterItem[];
  expense: CostCenterItem[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

// --- Estado do carrossel de meses ---

export interface MonthCarouselState {
  currentMonthKey: string; // "YYYY-MM"
  availableMonths: string[]; // lista de meses com dados
}

// --- Formulários ---

export interface TransactionFormData {
  categoryId: string;
  subcategoryId?: string;
  description: string;
  amount: string; // string para facilitar input, convertido antes de salvar
  date: string;
  observation?: string;
}

export interface SubcategoryFormData {
  name: string;
  categoryId: string;
}

export interface SavingsGoalFormData {
  amount: string;
  monthKey: string;
}
