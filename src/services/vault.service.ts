// ============================================================
// SERVIÇO DO COFRE
// Depósitos e retiradas ficam em coleção própria.
// O saldo é calculado no frontend somando todas as movimentações.
// ============================================================

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { VaultEntry, VaultEntryFormData } from '../types';
import { parseCurrencyInput } from '../utils/currency';

const vaultCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.VAULT);

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
  };
  const docRef = await addDoc(vaultCollection(userId), data);
  return { id: docRef.id, ...data };
};

/**
 * Remove uma movimentação do cofre.
 */
export const deleteVaultEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, COLLECTIONS.VAULT, entryId));
};
