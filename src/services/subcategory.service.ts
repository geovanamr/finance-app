// ============================================================
// SERVIÇO DE SUBCATEGORIAS
// CRUD de subcategorias no Firestore.
// Subcategorias são globais por usuário (não por mês).
// ============================================================

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { Subcategory, SubcategoryFormData } from '../types';

const subCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.SUBCATEGORIES);

/**
 * Busca todas as subcategorias do usuário.
 */
export const getAllSubcategories = async (userId: string): Promise<Subcategory[]> => {
  const q = query(subCollection(userId), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subcategory));
};

/**
 * Busca subcategorias de uma categoria específica.
 */
export const getSubcategoriesByCategory = async (
  userId: string,
  categoryId: string
): Promise<Subcategory[]> => {
  const q = query(
    subCollection(userId),
    where('categoryId', '==', categoryId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Subcategory))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Cria uma nova subcategoria.
 */
export const createSubcategory = async (
  userId: string,
  formData: SubcategoryFormData
): Promise<Subcategory> => {
  const data = {
    categoryId: formData.categoryId,
    name: formData.name.trim(),
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(subCollection(userId), data);
  return { id: docRef.id, ...data };
};

/**
 * Remove uma subcategoria.
 * Atenção: não remove as transações vinculadas a ela.
 */
export const deleteSubcategory = async (
  userId: string,
  subcategoryId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, COLLECTIONS.SUBCATEGORIES, subcategoryId);
  await deleteDoc(docRef);
};
