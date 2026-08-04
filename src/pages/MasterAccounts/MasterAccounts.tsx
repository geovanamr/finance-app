import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AccountProfile } from '../../types';
import { getAccountProfiles } from '../../services/accountDirectory.service';
import { logOut } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { useMasterStore } from '../../store/master.store';
import { useTransactionStore } from '../../store/transaction.store';
import { useVaultStore } from '../../store/vault.store';
import { useCategoryStore } from '../../store/category.store';
import { useUIStore } from '../../store/ui.store';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import styles from './MasterAccounts.module.css';

const formatLastAccess = (value: string): string => {
  if (!value) return 'Último acesso não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Último acesso não informado';
  return `Último acesso: ${new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)}`;
};

export const MasterAccounts: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { accounts, loading, setAccounts, setLoading, setSelectedAccountUid } = useMasterStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const loadAccounts = async (notify = false) => {
    setLoading(true);
    try {
      setAccounts(await getAccountProfiles());
      if (notify) showToast('Lista de contas atualizada.', 'success');
    } catch {
      setLoading(false);
      showToast('Não foi possível carregar a lista de contas.', 'error');
    }
  };

  useEffect(() => {
    setSelectedAccountUid(null);
    void loadAccounts();
    // A carga deve ocorrer apenas ao abrir a tela administrativa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleAccounts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return accounts;
    return accounts.filter((account) =>
      [account.displayName, account.email, account.uid]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term))
    );
  }, [accounts, search]);

  const selectAccount = (account: AccountProfile) => {
    useTransactionStore.getState().reset();
    useVaultStore.getState().reset();
    useCategoryStore.getState().reset();
    useUIStore.getState().reset();
    setSelectedAccountUid(account.uid);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      showToast('Erro ao sair. Tente novamente.', 'error');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <span className={styles.logo}>💰 Finance App</span>
            <span className={styles.badge}>MASTER</span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.masterEmail}>{user?.email}</span>
            <ThemeToggle />
            <button className={styles.logout} onClick={() => void handleLogout()}>Sair</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Painel administrativo</p>
            <h1>Qual conta você deseja visualizar?</h1>
            <p>Selecione um usuário para abrir os dados financeiros em modo somente leitura.</p>
          </div>
          <button
            className={styles.refresh}
            onClick={() => void loadAccounts(true)}
            disabled={loading}
          >
            {loading ? 'Atualizando…' : '↻ Atualizar lista'}
          </button>
        </section>

        <label className={styles.searchLabel}>
          <span className="sr-only">Buscar usuário</span>
          <input
            className={styles.search}
            type="search"
            placeholder="Buscar por nome ou e-mail"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {loading && accounts.length === 0 ? (
          <div className={styles.loading}><LoadingSpinner /></div>
        ) : visibleAccounts.length > 0 ? (
          <div className={styles.grid}>
            {visibleAccounts.map((account) => (
              <article className={styles.card} key={account.uid}>
                <div className={styles.avatar} aria-hidden="true">
                  {(account.displayName || account.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className={styles.accountInfo}>
                  <h2>{account.displayName || account.email || 'Usuário sem identificação'}</h2>
                  {account.displayName && account.email && <p>{account.email}</p>}
                  <small>{formatLastAccess(account.lastSignInAt)}</small>
                </div>
                <button className={styles.viewButton} onClick={() => selectAccount(account)}>
                  Visualizar conta →
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">👥</span>
            <h2>{accounts.length === 0 ? 'Nenhuma conta disponível' : 'Nenhuma conta encontrada'}</h2>
            <p>
              {accounts.length === 0
                ? 'Cada usuário precisa entrar no aplicativo ao menos uma vez para aparecer aqui.'
                : 'Tente buscar por outro nome ou e-mail.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
