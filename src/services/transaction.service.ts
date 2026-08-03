// ============================================================
// SERVIÇO DE TRANSAÇÕES
// CRUD de transações no Firestore.
// Todas as operações são escopadas pelo userId.
// ============================================================

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  deleteField,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { Transaction, TransactionFormData } from '../types';
import { dateToMonthKey } from '../utils/date';
import { getCategoryById } from './category.service';
import { parseCurrencyInput } from '../utils/currency';

// Caminho da coleção escopada por usuário
const txCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.TRANSACTIONS);

/**
 * Busca todas as transações de um mês específico.
 */
export const getTransactionsByMonth = async (
  userId: string,
  monthKey: string
): Promise<Transaction[]> => {
  const q = query(
    txCollection(userId),
    where('monthKey', '==', monthKey)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Transaction))
    .sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Busca transações em um intervalo de meses (para relatórios).
 */
export const getTransactionsByPeriod = async (
  userId: string,
  fromMonthKey: string,
  toMonthKey: string
): Promise<Transaction[]> => {
  const q = query(
    txCollection(userId),
    where('monthKey', '>=', fromMonthKey),
    where('monthKey', '<=', toMonthKey)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Transaction))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Cria uma nova transação.
 */
export const createTransaction = async (
  userId: string,
  formData: TransactionFormData
): Promise<Transaction> => {
  const category = await getCategoryById(userId, formData.categoryId);
  if (!category) throw new Error(`Categoria inválida: ${formData.categoryId}`);

  const monthKey = dateToMonthKey(formData.date);
  const amount = parseCurrencyInput(formData.amount);
  if (amount <= 0) throw new Error('Valor inválido.');

  const data = {
    categoryId: formData.categoryId,
    subcategoryId: formData.subcategoryId ?? null,
    description: formData.description.trim(),
    amount,
    date: formData.date,
    observation: formData.observation?.trim() ?? '',
    type: category.type,
    monthKey,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(txCollection(userId), data);
  return { id: docRef.id, ...data } as Transaction;
};

/**
 * Atualiza uma transação existente.
 */
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  formData: Partial<TransactionFormData>
): Promise<void> => {
  const docRef = doc(db, 'users', userId, COLLECTIONS.TRANSACTIONS, transactionId);
  const updates: Record<string, unknown> = {};

  if (formData.description) updates.description = formData.description.trim();
  if (formData.amount !== undefined) {
    const amount = parseCurrencyInput(formData.amount);
    if (amount <= 0) throw new Error('Valor inválido.');
    updates.amount = amount;
  }
  if (formData.date) {
    updates.date = formData.date;
    updates.monthKey = dateToMonthKey(formData.date);
  }
  if (formData.observation !== undefined) updates.observation = formData.observation.trim();
  if (formData.subcategoryId !== undefined) {
    updates.subcategoryId = formData.subcategoryId || null;
  }

  await updateDoc(docRef, updates);
};

/**
 * Remove uma transação.
 */
export const deleteTransaction = async (
  userId: string,
  transactionId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, COLLECTIONS.TRANSACTIONS, transactionId);
  await deleteDoc(docRef);
};

/**
 * Exclui um gasto criado pelo Cofre e decide se a retirada também será
 * removida. Quando ela é mantida, vira uma retirada comum sem destino.
 */
export const deleteVaultLinkedTransaction = async (
  userId: string,
  transaction: Transaction,
  deleteLinkedVaultEntry: boolean
): Promise<void> => {
  const transactionRef = doc(
    db,
    'users',
    userId,
    COLLECTIONS.TRANSACTIONS,
    transaction.id
  );
  const batch = writeBatch(db);
  batch.delete(transactionRef);

  if (transaction.vaultEntryId) {
    const vaultRef = doc(
      db,
      'users',
      userId,
      COLLECTIONS.VAULT,
      transaction.vaultEntryId
    );
    if (deleteLinkedVaultEntry) {
      batch.delete(vaultRef);
    } else {
      batch.update(vaultRef, {
        linkedTransactionId: deleteField(),
        destination: 'unassigned',
      });
    }
  }

  await batch.commit();
};
