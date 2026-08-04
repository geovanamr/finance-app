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
import { MasterAccountBar } from '../master/MasterAccountBar';
import { useDataOwner } from '../../hooks/useDataOwner';
import {
  getAccountProfiles,
  syncOwnAccountProfile,
} from '../../services/accountDirectory.service';
import { useMasterStore } from '../../store/master.store';

export const AppShell: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { dataOwnerId, isMaster } = useDataOwner();
  const setSubcategories = useTransactionStore((state) => state.setSubcategories);
  const setLoadingSubcategories = useTransactionStore((state) => state.setLoadingSubcategories);
  const setVaultEntries = useVaultStore((state) => state.setEntries);
  const setVaultLoading = useVaultStore((state) => state.setLoading);
  const { showToast } = useToast();
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setCategoriesLoading = useCategoryStore((state) => state.setLoading);
  const setAccounts = useMasterStore((state) => state.setAccounts);
  const setAccountsLoading = useMasterStore((state) => state.setLoading);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const syncDirectory = async () => {
      if (isMaster) setAccountsLoading(true);
      try {
        await syncOwnAccountProfile(user);
        if (isMaster) {
          const accounts = await getAccountProfiles();
          if (!cancelled) setAccounts(accounts);
        }
      } catch {
        if (cancelled) return;
        if (isMaster) setAccountsLoading(false);
        showToast('Não foi possível sincronizar o diretório de contas.', 'warning');
      }
    };

    void syncDirectory();
    return () => { cancelled = true; };
  }, [isMaster, setAccounts, setAccountsLoading, showToast, user]);

  useEffect(() => {
    if (!dataOwnerId || !user) return;
    let cancelled = false;

    setLoadingSubcategories(true);
    setVaultLoading(true);
    setCategoriesLoading(true);

    Promise.allSettled([
      getAllCategories(dataOwnerId).then((categories) =>
        categories.length > 0 || dataOwnerId !== user.uid
          ? categories
          : seedDefaultCategories(dataOwnerId)
      ),
      getAllSubcategories(dataOwnerId),
      getVaultEntries(dataOwnerId),
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
    dataOwnerId,
    setCategories,
    setCategoriesLoading,
    setLoadingSubcategories,
    setSubcategories,
    setVaultEntries,
    setVaultLoading,
    showToast,
    user,
  ]);

  return (
    <div className={styles.shell}>
      <TopNav />
      <MobileHeader />
      <MasterAccountBar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
