// ============================================================
// CONSTANTES GLOBAIS DA APLICAÇÃO
// ============================================================

export const APP_NAME = 'Finance App';
export const APP_VERSION = '1.0.0';

// Conta com acesso de leitura aos dados dos demais usuários.
// O UID identifica a conta no Firebase Authentication e não é uma credencial secreta.
export const MASTER_UID = 'DRvfe0BWNGVcy6KLm2bOM2YJRDJ3';

// Coleções do Firestore
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  SUBCATEGORIES: 'subcategories',
  SAVINGS_GOALS: 'savingsGoals',
  INSTALLMENT_PLANS: 'installmentPlans',
  VAULT: 'vault',
  ACCOUNT_DIRECTORY: 'accountDirectory',
} as const;

// Formato de datas
export const DATE_FORMAT = 'dd/MM/yyyy';
export const MONTH_KEY_FORMAT = 'yyyy-MM'; // usado como ID de mês

// Quantidade de meses exibidos no carrossel (antes e depois do atual)
export const CAROUSEL_MONTHS_RANGE = 6;

// Locale para formatação de moeda
export const CURRENCY_LOCALE = 'pt-BR';
export const CURRENCY_CODE = 'BRL';
