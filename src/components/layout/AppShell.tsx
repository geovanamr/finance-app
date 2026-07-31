// ============================================================
// COMPONENTE: AppShell — estrutura base de layout autenticado
// ============================================================

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import styles from './AppShell.module.css';
import { useAuthStore } from '../../store/auth.store';
import { useTransactionStore } from '../../store/transaction.store';
import { useVaultStore } from '../../store/vault.store';
import { getAllSubcategories } from '../../services/subcategory.service';
import { getVaultEntries } from '../../services/vault.service';
import { useToast } from '../ui/Toast';
import { useCategoryStore } from '../../store/category.store';
import { getAllCategories, seedDefaultCategories } from '../../services/category.service';

export const AppShell: React.FC = () => {
  const userId = useAuthStore((state) => state.user?.uid);
  const setSubcategories = useTransactionStore((state) => state.setSubcategories);
  const setLoadingSubcategories = useTransactionStore((state) => state.setLoadingSubcategories);
  const setVaultEntries = useVaultStore((state) => state.setEntries);
  const setVaultLoading = useVaultStore((state) => state.setLoading);
  const { showToast } = useToast();
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setCategoriesLoading = useCategoryStore((state) => state.setLoading);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    setLoadingSubcategories(true);
    setVaultLoading(true);
    setCategoriesLoading(true);

    Promise.allSettled([
      getAllCategories(userId).then((categories) =>
        categories.length > 0 ? categories : seedDefaultCategories(userId)
      ),
      getAllSubcategories(userId),
      getVaultEntries(userId),
    ]).then(([categoriesResult, subcategoriesResult, vaultResult]) => {
      if (cancelled) return;

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      } else {
        setCategoriesLoading(false);
        showToast('Erro ao carregar categorias.', 'error');
      }

      if (subcategoriesResult.status === 'fulfilled') {
        setSubcategories(subcategoriesResult.value);
      } else {
        setLoadingSubcategories(false);
        showToast('Erro ao carregar subcategorias.', 'error');
      }

      if (vaultResult.status === 'fulfilled') {
        setVaultEntries(vaultResult.value);
      } else {
        setVaultLoading(false);
        showToast('Erro ao carregar o cofre.', 'error');
      }
    });

    return () => { cancelled = true; };
  }, [
    userId,
    setCategories,
    setCategoriesLoading,
    setLoadingSubcategories,
    setSubcategories,
    setVaultEntries,
    setVaultLoading,
    showToast,
  ]);

  return (
    <div className={styles.shell}>
      <TopNav />
      <MobileHeader />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
