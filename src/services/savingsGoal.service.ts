// ============================================================
// SERVIÇO DE METAS DE ECONOMIA
// CRUD de metas mensais no Firestore.
// ============================================================

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { SavingsGoal, SavingsGoalFormData } from '../types';

const goalCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS);

/**
 * Busca a meta de economia de um mês específico.
 * Retorna null se não houver meta definida.
 */
export const getSavingsGoalByMonth = async (
  userId: string,
  monthKey: string
): Promise<SavingsGoal | null> => {
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
 * Cria ou atualiza a meta de economia de um mês.
 * Se já existir uma meta para o mês, atualiza. Caso contrário, cria.
 */
export const upsertSavingsGoal = async (
  userId: string,
  formData: SavingsGoalFormData
): Promise<SavingsGoal> => {
  const amount = parseFloat(formData.amount.replace(',', '.'));
  const existing = await getSavingsGoalByMonth(userId, formData.monthKey);

  if (existing) {
    const docRef = doc(db, 'users', userId, COLLECTIONS.SAVINGS_GOALS, existing.id);
    await updateDoc(docRef, { amount });
    return { ...existing, amount };
  }

  const data = { monthKey: formData.monthKey, amount };
  const docRef = await addDoc(goalCollection(userId), data);
  return { id: docRef.id, ...data };
};
