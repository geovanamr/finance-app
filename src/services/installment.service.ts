// ============================================================
// SERVIÇO DE PARCELAMENTOS
// Cria um plano de parcelamento e gera todas as transações
// futuras correspondentes no Firestore.
// ============================================================

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { InstallmentFormData, InstallmentPlan, Transaction } from '../types';
import { getCategoryById } from './category.service';
import { toMonthKey } from '../utils/date';
import { parseCurrencyInput, roundCurrency } from '../utils/currency';
import {
  calcFirstInstallmentDate,
  distributeInstallmentAmounts,
} from '../utils/installments';

// Coleções escopadas por usuário
const planCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.INSTALLMENT_PLANS);

const txCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.TRANSACTIONS);

/**
 * Calcula a data da primeira parcela: dia 01 do mês seguinte à data da compra.
 */
/** Cria o plano e todas as transações em uma única operação atômica. */
export const createInstallmentPlan = async (
  userId: string,
  formData: InstallmentFormData
): Promise<{ plan: InstallmentPlan; transactions: Transaction[] }> => {
  const category = await getCategoryById(userId, formData.categoryId);
  if (!category) throw new Error(`Categoria inválida: ${formData.categoryId}`);

  const totalAmount = parseCurrencyInput(formData.totalAmount);
  const totalInstallments = Number(formData.totalInstallments);
  const firstInstallmentDate = calcFirstInstallmentDate(formData.purchaseDate);

  if (isNaN(totalAmount) || totalAmount <= 0) throw new Error('Valor total inválido.');
  if (!formData.description.trim()) throw new Error('Descrição obrigatória.');
  if (!formData.purchaseDate) throw new Error('Data da compra obrigatória.');
  if (!Number.isInteger(totalInstallments) || totalInstallments < 1) throw new Error('Número de parcelas inválido.');
  if (totalInstallments > 360) throw new Error('O limite é de 360 parcelas.');
  const installmentAmounts = distributeInstallmentAmounts(totalAmount, totalInstallments);
  const installmentAmount = roundCurrency(installmentAmounts[0]);

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

  const planRef = doc(planCollection(userId));
  const plan: InstallmentPlan = { id: planRef.id, ...planData };
  const batch = writeBatch(db);
  batch.set(planRef, planData);

  // Gera as transações de cada parcela
  const transactions: Transaction[] = [];
  const [fy, fm] = firstInstallmentDate.split('-').map(Number);

  for (let i = 0; i < totalInstallments; i++) {
    // Avança i meses a partir da primeira parcela
    const installDate = new Date(fy, fm - 1 + i, 1);
    const dateStr = `${installDate.getFullYear()}-${String(installDate.getMonth() + 1).padStart(2, '0')}-01`;
    const monthKey = toMonthKey(installDate);
    const label = `${i + 1}/${totalInstallments} ${formData.description.trim()}`;
    const currentInstallmentAmount = installmentAmounts[i];

    const txData = {
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || null,
      description: label,
      amount: currentInstallmentAmount,
      date: dateStr,
      observation: formData.observation?.trim() ?? '',
      type: category.type,
      monthKey,
      createdAt: now,
      installmentPlanId: planRef.id,
      installmentNumber: i + 1,
      totalInstallments,
    };

    const txRef = doc(txCollection(userId));
    batch.set(txRef, txData);
    transactions.push({ id: txRef.id, ...txData } as Transaction);
  }

  await batch.commit();

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
  const linkedQuery = query(
    txCollection(userId),
    where('installmentPlanId', '==', planId)
  );
  const snapshot = await getDocs(linkedQuery);
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', userId, COLLECTIONS.INSTALLMENT_PLANS, planId));
  snapshot.docs.forEach((linkedDoc) => batch.delete(linkedDoc.ref));
  await batch.commit();
};
