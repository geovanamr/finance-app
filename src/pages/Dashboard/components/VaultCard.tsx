// ============================================================
// COMPONENTE: VaultCard — card do cofre no dashboard
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaultStore } from '../../../store/vault.store';
import { usePrivacy } from '../../../context/PrivacyContext';
import styles from './VaultCard.module.css';

export const VaultCard: React.FC = () => {
  const { balance, entries } = useVaultStore();
  const { privateCurrency } = usePrivacy();
  const navigate = useNavigate();

  return (
    <div className={styles.card} onClick={() => navigate('/vault')} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/vault')}>
      <div className={styles.left}>
        <span className={styles.icon}>🏦</span>
        <div>
          <span className={styles.label}>Cofre</span>
          <span className={styles.count}>
            {entries.length} movimentação{entries.length !== 1 ? 'ões' : ''}
          </span>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.balance}>{privateCurrency(balance)}</span>
        <span className={styles.arrow}>›</span>
      </div>
    </div>
  );
};
