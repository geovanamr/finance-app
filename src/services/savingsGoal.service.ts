// ============================================================
// SERVIÇO DE OBJETIVOS DE SALDO
// CRUD de objetivos mensais no Firestore.
// ============================================================

import {
  collection,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  limit,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { SavingsGoal, SavingsGoalFormData } from '../types';
import { parseCurrencyInput } from '../utils/currency';

const goalCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS);

/**
 * Busca o objetivo de saldo de um mês específico.
 * Retorna null se não houver objetivo definido.
 */
export const getSavingsGoalByMonth = async (
  userId: string,
  monthKey: string
): Promise<SavingsGoal | null> => {
  const canonicalRef = doc(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS, monthKey);
  const canonical = await getDoc(canonicalRef);
  if (canonical.exists()) {
    return { id: canonical.id, ...canonical.data() } as SavingsGoal;
  }

  const q = query(
    goalCollection(userId),
    where('monthKey', '==', monthKey),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as SavingsGoal;
};

/**
 * Cria ou atualiza o objetivo de saldo de um mês.
 * Se já existir um objetivo para o mês, atualiza. Caso contrário, cria.
 */
export const upsertSavingsGoal = async (
  userId: string,
  formData: SavingsGoalFormData
): Promise<SavingsGoal> => {
  const amount = parseCurrencyInput(formData.amount);
  if (amount <= 0) throw new Error('Valor inválido.');
  const existing = await getSavingsGoalByMonth(userId, formData.monthKey);

  if (existing) {
    const docRef = doc(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS, existing.id);
    await updateDoc(docRef, { amount });
    return { ...existing, amount };
  }

  const data = { monthKey: formData.monthKey, amount };
  const docRef = doc(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS, formData.monthKey);
  await setDoc(docRef, data);
  return { id: docRef.id, ...data };
};

/** Remove o objetivo de saldo definido para um mês. */
export const deleteSavingsGoal = async (
  userId: string,
  monthKey: string
): Promise<void> => {
  const existing = await getSavingsGoalByMonth(userId, monthKey);
  if (!existing) return;

  await deleteDoc(
    doc(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS, existing.id)
  );
};
