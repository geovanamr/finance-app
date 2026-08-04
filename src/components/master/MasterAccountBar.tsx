import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterStore } from '../../store/master.store';
import { useTransactionStore } from '../../store/transaction.store';
import { useUIStore } from '../../store/ui.store';
import { useVaultStore } from '../../store/vault.store';
import { useCategoryStore } from '../../store/category.store';
import { useDataOwner } from '../../hooks/useDataOwner';
import styles from './MasterAccountBar.module.css';

export const MasterAccountBar: React.FC = () => {
  const navigate = useNavigate();
  const { isMaster } = useDataOwner();
  const accounts = useMasterStore((state) => state.accounts);
  const selectedAccountUid = useMasterStore((state) => state.selectedAccountUid);
  const setSelectedAccountUid = useMasterStore((state) => state.setSelectedAccountUid);

  if (!isMaster || !selectedAccountUid) return null;

  const selectedAccount = accounts.find((account) => account.uid === selectedAccountUid);
  const accountLabel = selectedAccount?.displayName
    || selectedAccount?.email
    || selectedAccountUid;

  const handleBack = () => {
    useTransactionStore.getState().reset();
    useVaultStore.getState().reset();
    useCategoryStore.getState().reset();
    useUIStore.getState().reset();
    setSelectedAccountUid(null);
    navigate('/accounts');
  };

  return (
    <aside className={styles.bar} aria-label="Acesso master">
      <div className={styles.inner}>
        <div className={styles.identity}>
          <span className={styles.badge}>MASTER</span>
          <span className={styles.label}>Visualizando:</span>
          <strong className={styles.account}>{accountLabel}</strong>
        </div>

        <span className={[styles.mode, styles.readOnly].join(' ')}>
          Somente visualização
        </span>

        <button className={styles.back} onClick={handleBack}>
          ← Voltar para contas
        </button>
      </div>
    </aside>
  );
};
