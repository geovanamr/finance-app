// ============================================================
// COMPONENTE: SavingsGoalModal — definir meta de economia do mês
// ============================================================

import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTransactionStore } from '../../../store/transaction.store';
import { useAuthStore } from '../../../store/auth.store';
import { upsertSavingsGoal } from '../../../services/savingsGoal.service';
import { useToast } from '../../../components/ui/Toast';
import { formatMonthLabel } from '../../../utils/date';
import styles from './SavingsGoalModal.module.css';

interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  monthKey: string;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  open,
  onClose,
  monthKey,
}) => {
  const { currentGoal, setCurrentGoal } = useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(currentGoal ? currentGoal.amount.toFixed(2).replace('.', ',') : '');
      setError('');
    }
  }, [open, currentGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setLoading(true);
    try {
      const goal = await upsertSavingsGoal(user.uid, { amount, monthKey });
      setCurrentGoal(goal);
      showToast('Meta definida com sucesso!', 'success');
      onClose();
    } catch {
      showToast('Erro ao salvar meta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`🎯 Meta de economia — ${formatMonthLabel(monthKey)}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <p className={styles.hint}>
          Defina quanto deseja economizar neste mês. O progresso será exibido no dashboard.
        </p>

        <Input
          label="Meta (R$) *"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(''); }}
          placeholder="0,00"
          error={error}
          leftIcon="R$"
          autoFocus
        />

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar meta
          </Button>
        </div>
      </form>
    </Modal>
  );
};
