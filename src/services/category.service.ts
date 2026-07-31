import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import type { Category, CategoryFormData } from '../types';

const categoryCollection = (userId: string) =>
  collection(db, 'users', userId, COLLECTIONS.CATEGORIES);

export const getAllCategories = async (userId: string): Promise<Category[]> => {
  const snapshot = await getDocs(query(categoryCollection(userId), orderBy('order')));
  return snapshot.docs.map((categoryDoc) => ({
    id: categoryDoc.id,
    ...categoryDoc.data(),
  } as Category));
};

export const seedDefaultCategories = async (userId: string): Promise<Category[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}default-categories.json`);
  if (!response.ok) throw new Error('Não foi possível carregar as categorias iniciais.');

  const seed = await response.json() as Array<Omit<Category, 'createdAt'>>;
  const createdAt = new Date().toISOString();
  const batch = writeBatch(db);
  const categories = seed.map((item) => {
    const { id, ...data } = item;
    const category: Category = { id, ...data, createdAt };
    batch.set(doc(categoryCollection(userId), id), { ...data, createdAt });
    return category;
  });

  await batch.commit();
  return categories;
};

export const getCategoryById = async (
  userId: string,
  categoryId: string
): Promise<Category | null> => {
  const snapshot = await getDoc(
    doc(db, 'users', userId, COLLECTIONS.CATEGORIES, categoryId)
  );
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() } as Category
    : null;
};

export const createCategory = async (
  userId: string,
  formData: CategoryFormData,
  order: number
): Promise<Category> => {
  const name = formData.name.trim();
  const icon = formData.icon.trim();
  if (!name) throw new Error('Nome obrigatório.');
  if (!icon) throw new Error('Ícone obrigatório.');

  const data: Omit<Category, 'id'> = {
    name,
    type: formData.type,
    icon,
    color: formData.color,
    order,
    createdAt: new Date().toISOString(),
  };
  const categoryRef = await addDoc(categoryCollection(userId), data);
  return { id: categoryRef.id, ...data };
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  formData: CategoryFormData
): Promise<void> => {
  const name = formData.name.trim();
  const icon = formData.icon.trim();
  if (!name) throw new Error('Nome obrigatório.');
  if (!icon) throw new Error('Ícone obrigatório.');

  await updateDoc(
    doc(db, 'users', userId, COLLECTIONS.CATEGORIES, categoryId),
    { ...formData, name, icon }
  );
};

export const deleteCategory = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  const transactionsQuery = query(
    collection(db, 'users', userId, COLLECTIONS.TRANSACTIONS),
    where('categoryId', '==', categoryId),
    limit(1)
  );
  const subcategoriesQuery = query(
    collection(db, 'users', userId, COLLECTIONS.SUBCATEGORIES),
    where('categoryId', '==', categoryId),
    limit(1)
  );
  const [transactions, subcategories] = await Promise.all([
    getDocs(transactionsQuery),
    getDocs(subcategoriesQuery),
  ]);

  if (!transactions.empty || !subcategories.empty) {
    throw new Error('A categoria possui lançamentos ou subcategorias e não pode ser excluída.');
  }

  await deleteDoc(doc(db, 'users', userId, COLLECTIONS.CATEGORIES, categoryId));
};
