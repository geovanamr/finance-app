import { create } from 'zustand';
import type { Category } from '../types';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  reset: () => void;
}

const sortCategories = (categories: Category[]) =>
  [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  setCategories: (categories) => set({ categories: sortCategories(categories), loading: false }),
  setLoading: (loading) => set({ loading }),
  addCategory: (category) =>
    set((state) => ({ categories: sortCategories([...state.categories, category]) })),
  updateCategory: (id, data) =>
    set((state) => ({
      categories: sortCategories(
        state.categories.map((category) =>
          category.id === id ? { ...category, ...data } : category
        )
      ),
    })),
  removeCategory: (id) =>
    set((state) => ({ categories: state.categories.filter((category) => category.id !== id) })),
  reset: () => set({ categories: [], loading: false }),
}));
