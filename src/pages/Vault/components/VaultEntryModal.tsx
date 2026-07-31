// ============================================================
// COMPONENTE: VaultEntryModal — formulário de depósito/retirada
// ============================================================

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useVaultStore } from '../../../store/vault.store';
import { useAuthStore } from '../../../store/auth.store';
import { createVaultEntry } from '../../../services/vault.service';
import { useToast } from '../../../components/ui/Toast';
import type { VaultEntryType } from '../../../types';
import styles from './VaultEntryModal.module.css';

interface VaultEntryModalProps {
  open: boolean;
  onClose: () => void;
  type: VaultEntryType;
}

export const VaultEntryModal: React.FC<VaultEntryModalProps> = ({
  open,
  onClose,
  type,
}) => {
  const { addEntry } = useVaultStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDeposit = type === 'deposit';
  const title = isDeposit ? '⬇️ Depositar no Cofre' : '⬆️ Retirar do Cofre';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!description.trim()) e.description = 'Descrição obrigatória.';
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0)
      e.amount = 'Valor deve ser maior que zero.';
    if (!date) e.date = 'Data obrigatória.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;
    setLoading(true);
    try {
      const entry = await createVaultEntry(user.uid, {
        type,
        amount,
        date,
        description,
        observation,
      });
      addEntry(entry);
      showToast(isDeposit ? 'Depósito registrado!' : 'Retirada registrada!', 'success');
      onClose();
    } catch {
      showToast('Erro ao registrar movimentação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Descrição *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isDeposit ? 'Ex: Reserva do salário' : 'Ex: Compra do notebook'}
          error={errors.description}
          maxLength={100}
        />

        <Input
          label="Valor (R$) *"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          error={errors.amount}
          leftIcon="R$"
        />

        <Input
          label="Data *"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />

        <div className={styles.field}>
          <label className={styles.label}>Observação</label>
          <textarea
            className={styles.textarea}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Opcional..."
            rows={2}
            maxLength={200}
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={isDeposit ? 'income' : 'expense'}
            loading={loading}
          >
            {isDeposit ? 'Depositar' : 'Retirar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
