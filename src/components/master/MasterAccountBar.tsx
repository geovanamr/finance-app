import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountProfiles } from '../../services/accountDirectory.service';
import { useAuthStore } from '../../store/auth.store';
import { useCategoryStore } from '../../store/category.store';
import { useMasterStore } from '../../store/master.store';
import { useTransactionStore } from '../../store/transaction.store';
import { useUIStore } from '../../store/ui.store';
import { useVaultStore } from '../../store/vault.store';
import { useDataOwner } from '../../hooks/useDataOwner';
import { useToast } from '../ui/Toast';
import styles from './MasterAccountBar.module.css';

export const MasterAccountBar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { accounts, selectedAccountUid, loading, setAccounts, setLoading, setSelectedAccountUid } =
    useMasterStore();
  const { isMaster, isReadOnly } = useDataOwner();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!isMaster || !user) return null;

  const ownProfile = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    createdAt: user.metadata.creationTime ?? '',
    lastSignInAt: user.metadata.lastSignInTime ?? '',
    syncedAt: '',
  };
  const visibleAccounts = accounts.some((account) => account.uid === user.uid)
    ? accounts
    : [ownProfile, ...accounts];

  const resetLoadedData = () => {
    useTransactionStore.getState().reset();
    useVaultStore.getState().reset();
    useCategoryStore.getState().reset();
    useUIStore.getState().reset();
  };

  const handleSelect = (uid: string) => {
    resetLoadedData();
    setSelectedAccountUid(uid === user.uid ? null : uid);
    navigate('/dashboard');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      setAccounts(await getAccountProfiles());
      showToast('Lista de contas atualizada.', 'success');
    } catch {
      setLoading(false);
      showToast('Não foi possível atualizar a lista de contas.', 'error');
    }
  };

  return (
    <aside className={styles.bar} aria-label="Acesso master">
      <div className={styles.inner}>
        <div className={styles.identity}>
          <span className={styles.badge}>MASTER</span>
          <span className={styles.label}>Visualizar conta</span>
        </div>

        <select
          className={styles.select}
          value={selectedAccountUid ?? user.uid}
          onChange={(event) => handleSelect(event.target.value)}
          disabled={loading}
          aria-label="Conta visualizada"
        >
          {visibleAccounts.map((account) => (
            <option key={account.uid} value={account.uid}>
              {account.uid === user.uid ? 'Minha conta — ' : ''}
              {account.displayName || account.email || account.uid}
            </option>
          ))}
        </select>

        <button className={styles.refresh} onClick={() => void handleRefresh()} disabled={loading}>
          {loading ? 'Atualizando…' : 'Atualizar lista'}
        </button>

        <span className={[styles.mode, isReadOnly ? styles.readOnly : styles.own].join(' ')}>
          {isReadOnly ? 'Somente visualização' : 'Sua conta — edição permitida'}
        </span>
      </div>
    </aside>
  );
};
