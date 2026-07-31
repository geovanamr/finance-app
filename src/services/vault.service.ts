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
import type { VaultEntry, VaultEntryFormData } from '../types';

const vaultCollection = (userId: string) =>
  collection(db, 'users', userId, 'vault');

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
  const amount = parseFloat(formData.amount.replace(',', '.'));
  const data: Omit<VaultEntry, 'id'> = {
    type: formData.type,
    amount,
    date: formData.date,
    description: formData.description.trim(),
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
  await deleteDoc(doc(db, 'users', userId, 'vault', entryId));
};

/**
 * Calcula o saldo atual do cofre a partir das movimentações.
 */
export const calcVaultBalance = (entries: VaultEntry[]): number =>
  entries.reduce(
    (sum, e) => (e.type === 'deposit' ? sum + e.amount : sum - e.amount),
    0
  );
