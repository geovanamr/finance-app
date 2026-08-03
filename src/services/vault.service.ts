// ============================================================
// SERVIÇO DO COFRE
// Depósitos e retiradas ficam em coleção própria.
// O saldo é calculado no frontend somando todas as movimentações.
// ============================================================

import {
  collection,
  addDoc,
  deleteField,
  doc,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type {
  Transaction,
  TransactionFormData,
  VaultEntry,
  VaultEntryFormData,
} from '../types';
import { parseCurrencyInput } from '../utils/currency';
import { dateToMonthKey } from '../utils/date';
import { getCategoryById } from './category.service';

const vaultCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.VAULT);

const txCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.TRANSACTIONS);

/**
 * Busca todas as movimentações do cofre, ordenadas por data desc.
 */
export const getVaultEntries = async (userId: string): Promise<VaultEntry[]> => {
  const q = query(vaultCollection(userId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as VaultEntry))
    .sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Registra uma movimentação no cofre.
 * type 'deposit' = entrada no cofre (saída do mês)
 * type 'withdraw' = retirada do cofre (entrada no mês)
 */
export const createVaultEntry = async (
  userId: string,
  formData: VaultEntryFormData
): Promise<VaultEntry> => {
  const amount = parseCurrencyInput(formData.amount);
  if (amount <= 0) throw new Error('Valor inválido.');
  const description = formData.description.trim();
  if (!description) throw new Error('Descrição obrigatória.');
  if (!formData.date) throw new Error('Data obrigatória.');
  const data: Omit<VaultEntry, 'id'> = {
    type: formData.type,
    amount,
    date: formData.date,
    description,
    observation: formData.observation?.trim() ?? '',
    createdAt: new Date().toISOString(),
    ...(formData.type === 'withdraw' ? { destination: 'unassigned' as const } : {}),
  };
  const docRef = await addDoc(vaultCollection(userId), data);
  return { id: docRef.id, ...data };
};

/** Cria a retirada e o gasto correspondente em uma única gravação. */
export const createVaultWithdrawalWithExpense = async (
  userId: string,
  formData: TransactionFormData
): Promise<{ entry: VaultEntry; transaction: Transaction }> => {
  const category = await getCategoryById(userId, formData.categoryId);
  if (!category || category.type !== 'expense') {
    throw new Error('Categoria de gasto inválida.');
  }

  const amount = parseCurrencyInput(formData.amount);
  const description = formData.description.trim();
  if (amount <= 0) throw new Error('Valor inválido.');
  if (!description) throw new Error('Descrição obrigatória.');
  if (!formData.date) throw new Error('Data obrigatória.');

  const vaultRef = doc(vaultCollection(userId));
  const transactionRef = doc(txCollection(userId));
  const createdAt = new Date().toISOString();
  const observation = formData.observation?.trim() ?? '';

  const entry: VaultEntry = {
    id: vaultRef.id,
    type: 'withdraw',
    amount,
    date: formData.date,
    description,
    observation,
    createdAt,
    destination: 'expense',
    linkedTransactionId: transactionRef.id,
  };
  const transaction: Transaction = {
    id: transactionRef.id,
    categoryId: formData.categoryId,
    subcategoryId: formData.subcategoryId || undefined,
    description,
    amount,
    date: formData.date,
    observation,
    type: 'expense',
    monthKey: dateToMonthKey(formData.date),
    createdAt,
    paymentSource: 'vault',
    vaultEntryId: vaultRef.id,
  };

  const batch = writeBatch(db);
  const entryData: Omit<VaultEntry, 'id'> = {
    type: entry.type,
    amount: entry.amount,
    date: entry.date,
    description: entry.description,
    observation: entry.observation,
    createdAt: entry.createdAt,
    destination: entry.destination,
    linkedTransactionId: entry.linkedTransactionId,
  };
  const transactionData = {
    categoryId: transaction.categoryId,
    subcategoryId: transaction.subcategoryId ?? null,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    observation: transaction.observation,
    type: transaction.type,
    monthKey: transaction.monthKey,
    createdAt: transaction.createdAt,
    paymentSource: transaction.paymentSource,
    vaultEntryId: transaction.vaultEntryId,
  };
  batch.set(vaultRef, entryData);
  batch.set(transactionRef, transactionData);
  await batch.commit();

  return { entry, transaction };
};

/** Mantém a retirada sincronizada ao editar seu gasto vinculado. */
export const updateVaultLinkedExpense = async (
  userId: string,
  transactionId: string,
  vaultEntryId: string,
  formData: TransactionFormData
): Promise<void> => {
  const amount = parseCurrencyInput(formData.amount);
  const description = formData.description.trim();
  if (amount <= 0) throw new Error('Valor inválido.');
  if (!description || !formData.date) throw new Error('Dados obrigatórios ausentes.');

  const observation = formData.observation?.trim() ?? '';
  const batch = writeBatch(db);
  batch.update(doc(txCollection(userId), transactionId), {
    subcategoryId: formData.subcategoryId || null,
    description,
    amount,
    date: formData.date,
    observation,
    monthKey: dateToMonthKey(formData.date),
  });
  batch.update(doc(vaultCollection(userId), vaultEntryId), {
    description,
    amount,
    date: formData.date,
    observation,
  });
  await batch.commit();
};

/**
 * Remove uma movimentação do cofre.
 */
export const deleteVaultEntry = async (
  userId: string,
  entry: VaultEntry,
  deleteLinkedTransaction = false
): Promise<void> => {
  const batch = writeBatch(db);
  batch.delete(doc(vaultCollection(userId), entry.id));

  if (entry.linkedTransactionId) {
    const linkedTransactionRef = doc(txCollection(userId), entry.linkedTransactionId);
    if (deleteLinkedTransaction) {
      batch.delete(linkedTransactionRef);
    } else {
      batch.update(linkedTransactionRef, {
        paymentSource: deleteField(),
        vaultEntryId: deleteField(),
      });
    }
  }

  await batch.commit();
};
