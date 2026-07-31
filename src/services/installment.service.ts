// ============================================================
// SERVIÇO DE PARCELAMENTOS
// Cria um plano de parcelamento e gera todas as transações
// futuras correspondentes no Firestore.
// ============================================================

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { InstallmentFormData, InstallmentPlan, Transaction } from '../types';
import { getCategoryById } from '../config/categories';
import { toMonthKey } from '../utils/date';

// Coleções escopadas por usuário
const planCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.INSTALLMENT_PLANS);

const txCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.TRANSACTIONS);

/**
 * Calcula a data da primeira parcela: dia 01 do mês seguinte à data da compra.
 */
export const calcFirstInstallmentDate = (purchaseDate: string): string => {
  const [year, month] = purchaseDate.split('-').map(Number);
  const next = new Date(year, month, 1); // month sem -1 já avança um mês
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
};

/**
 * Cria o plano de parcelamento e gera todas as transações no Firestore.
 * Retorna o plano criado e as transações geradas.
 */
export const createInstallmentPlan = async (
  userId: string,
  formData: InstallmentFormData
): Promise<{ plan: InstallmentPlan; transactions: Transaction[] }> => {
  const category = getCategoryById(formData.categoryId);
  if (!category) throw new Error(`Categoria inválida: ${formData.categoryId}`);

  const totalAmount = parseFloat(formData.totalAmount.replace(',', '.'));
  const installmentAmount = parseFloat(formData.installmentAmount.replace(',', '.'));
  const totalInstallments = parseInt(formData.totalInstallments, 10);
  const firstInstallmentDate = calcFirstInstallmentDate(formData.purchaseDate);

  if (isNaN(totalAmount) || totalAmount <= 0) throw new Error('Valor total inválido.');
  if (isNaN(installmentAmount) || installmentAmount <= 0) throw new Error('Valor da parcela inválido.');
  if (isNaN(totalInstallments) || totalInstallments < 1) throw new Error('Número de parcelas inválido.');

  const now = new Date().toISOString();

  // Salva o plano
  const planData: Omit<InstallmentPlan, 'id'> = {
    categoryId: formData.categoryId,
    subcategoryId: formData.subcategoryId || undefined,
    description: formData.description.trim(),
    totalAmount,
    installmentAmount,
    totalInstallments,
    purchaseDate: formData.purchaseDate,
    firstInstallmentDate,
    observation: formData.observation?.trim() ?? '',
    type: category.type,
    createdAt: now,
  };

  const planRef = await addDoc(planCollection(userId), planData);
  const plan: InstallmentPlan = { id: planRef.id, ...planData };

  // Gera as transações de cada parcela
  const transactions: Transaction[] = [];
  const [fy, fm] = firstInstallmentDate.split('-').map(Number);

  for (let i = 0; i < totalInstallments; i++) {
    // Avança i meses a partir da primeira parcela
    const installDate = new Date(fy, fm - 1 + i, 1);
    const dateStr = `${installDate.getFullYear()}-${String(installDate.getMonth() + 1).padStart(2, '0')}-01`;
    const monthKey = toMonthKey(installDate);
    const label = `${i + 1}/${totalInstallments} ${formData.description.trim()}`;

    const txData = {
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || null,
      description: label,
      amount: installmentAmount,
      date: dateStr,
      observation: formData.observation?.trim() ?? '',
      type: category.type,
      monthKey,
      createdAt: now,
      installmentPlanId: planRef.id,
      installmentNumber: i + 1,
      totalInstallments,
    };

    const txRef = await addDoc(txCollection(userId), txData);
    transactions.push({ id: txRef.id, ...txData } as Transaction);
  }

  return { plan, transactions };
};

/**
 * Busca todos os planos de parcelamento do usuário.
 */
export const getInstallmentPlans = async (userId: string): Promise<InstallmentPlan[]> => {
  const q = query(planCollection(userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InstallmentPlan));
};

/**
 * Remove um plano e todas as transações associadas a ele.
 */
export const deleteInstallmentPlan = async (
  userId: string,
  planId: string
): Promise<void> => {
  // Remove o plano
  await deleteDoc(doc(db, 'users', userId, COLLECTIONS.INSTALLMENT_PLANS, planId));

  // Remove todas as transações vinculadas ao plano
  const txCol = txCollection(userId);
  const snapshot = await getDocs(txCol);
  const linked = snapshot.docs.filter((d) => d.data().installmentPlanId === planId);
  await Promise.all(linked.map((d) => deleteDoc(d.ref)));
};
