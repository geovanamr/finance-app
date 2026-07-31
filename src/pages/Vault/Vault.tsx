// ============================================================
// PÁGINA: Vault — Cofre
// ============================================================

import React, { useEffect, useState } from 'react';
import { useVaultStore } from '../../store/vault.store';
import { useAuthStore } from '../../store/auth.store';
import { getVaultEntries, deleteVaultEntry } from '../../services/vault.service';
import { formatDate } from '../../utils/date';

import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { usePrivacy } from '../../context/PrivacyContext';
import { VaultEntryModal } from './components/VaultEntryModal';
import type { VaultEntryType } from '../../types';
import styles from './Vault.module.css';

// Ícone SVG do cofre
const VaultIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9v-2M12 17v-2M9 12H7M17 12h-2" />
    <path d="M6 4V2M18 4V2" />
    <circle cx="12" cy="12" r="1" fill="white" stroke="none" />
  </svg>
);

// Ícone de depósito
const DepositIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

// Ícone de retirada
const WithdrawIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21V9M7 14l5-5 5 5" />
    <path d="M5 4h14" />
  </svg>
);

export const Vault: React.FC = () => {
  const { entries, balance, loading, setEntries, setLoading, removeEntry } = useVaultStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<VaultEntryType>('deposit');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getVaultEntries(user.uid);
        setEntries(data);
      } catch {
        showToast('Erro ao carregar cofre.', 'error');
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleDelete = async (id: string, description: string) => {
    if (!user) return;
    if (!confirm(`Excluir "${description}"?`)) return;
    try {
      await deleteVaultEntry(user.uid, id);
      removeEntry(id);
      showToast('Movimentação excluída.', 'success');
    } catch {
      showToast('Erro ao excluir.', 'error');
    }
  };

  const openModal = (type: VaultEntryType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const { privateCurrency } = usePrivacy();
  const deposits  = entries.filter(e => e.type === 'deposit').reduce((s, e) => s + e.amount, 0);
  const withdraws = entries.filter(e => e.type === 'withdraw').reduce((s, e) => s + e.amount, 0);

  return (
    <div className={styles.page}>
      {/* Saldo */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceIconWrapper}>
          <VaultIcon />
        </div>
        <span className={styles.balanceLabel}>Saldo do Cofre</span>
        <span className={styles.balanceValue}>{privateCurrency(balance)}</span>
        <span className={styles.balanceCount}>
          {entries.length} movimentação{entries.length !== 1 ? 'ões' : ''}
          {entries.length > 0 && ` · +${privateCurrency(deposits)} / -${privateCurrency(withdraws)}`}
        </span>
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        <Button variant="income" fullWidth onClick={() => openModal('deposit')} icon={<DepositIcon />}>
          Depositar
        </Button>
        <Button variant="expense" fullWidth onClick={() => openModal('withdraw')} icon={<WithdrawIcon />}>
          Retirar
        </Button>
      </div>

      {/* Histórico */}
      <div className={styles.history}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>Histórico</h2>
          {entries.length > 0 && (
            <span className={styles.historyCount}>{entries.length}</span>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}><LoadingSpinner /></div>
        ) : entries.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🏦</span>
            <span>Nenhuma movimentação ainda.</span>
          </div>
        ) : (
          <div className={styles.list}>
            {entries.map((entry) => (
              <div key={entry.id} className={styles.entry}>
                <div className={[
                  styles.entryIconWrapper,
                  entry.type === 'deposit' ? styles.entryIconDeposit : styles.entryIconWithdraw,
                ].join(' ')}>
                  {entry.type === 'deposit' ? <DepositIcon /> : <WithdrawIcon />}
                </div>

                <div className={styles.entryInfo}>
                  <span className={styles.entryDesc}>{entry.description}</span>
                  <span className={styles.entryMeta}>
                    {entry.type === 'deposit' ? 'Depósito' : 'Retirada'} · {formatDate(entry.date)}
                  </span>
                  {entry.observation && (
                    <span className={styles.entryObs}>{entry.observation}</span>
                  )}
                </div>

                <div className={styles.entryRight}>
                  <span className={[
                    styles.entryAmount,
                    entry.type === 'deposit' ? styles.deposit : styles.withdraw,
                  ].join(' ')}>
                    {entry.type === 'deposit' ? '+' : '-'} {privateCurrency(entry.amount)}
                  </span>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(entry.id, entry.description)}
                    aria-label="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <VaultEntryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
        />
      )}
    </div>
  );
};
