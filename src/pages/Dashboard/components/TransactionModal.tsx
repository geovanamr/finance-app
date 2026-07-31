// ============================================================
// COMPONENTE: TransactionModal — formulário de transação
// ============================================================

import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTransactionStore } from '../../../store/transaction.store';
import { useAuthStore } from '../../../store/auth.store';
import { createTransaction, updateTransaction } from '../../../services/transaction.service';
import { useToast } from '../../../components/ui/Toast';
import type { Category, Transaction, TransactionFormData } from '../../../types';
import styles from './TransactionModal.module.css';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  category: Category;
  monthKey?: string;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  onClose,
  category,
  editingTransaction,
}) => {
  const { subcategories, addTransaction, updateTransaction: updateStore } =
    useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const categorySubs = subcategories.filter((s) => s.categoryId === category.id);

  // Estado do formulário
  const [form, setForm] = useState<TransactionFormData>({
    categoryId: category.id,
    subcategoryId: '',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    observation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});

  // Preenche o formulário ao editar
  useEffect(() => {
    if (editingTransaction) {
      setForm({
        categoryId: editingTransaction.categoryId,
        subcategoryId: editingTransaction.subcategoryId ?? '',
        description: editingTransaction.description,
        amount: editingTransaction.amount.toFixed(2).replace('.', ','),
        date: editingTransaction.date,
        observation: editingTransaction.observation ?? '',
      });
    } else {
      setForm({
        categoryId: category.id,
        subcategoryId: '',
        description: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        observation: '',
      });
    }
    setErrors({});
  }, [editingTransaction, open]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.description.trim()) newErrors.description = 'Descrição obrigatória.';
    if (!form.amount || parseFloat(form.amount.replace(',', '.')) <= 0)
      newErrors.amount = 'Valor deve ser maior que zero.';
    if (!form.date) newErrors.date = 'Data obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;

    setLoading(true);
    try {
      if (editingTransaction) {
        await updateTransaction(user.uid, editingTransaction.id, form);
        updateStore(editingTransaction.id, {
          ...form,
          amount: parseFloat(form.amount.replace(',', '.')),
          subcategoryId: form.subcategoryId || undefined,
        });
        showToast('Lançamento atualizado!', 'success');
      } else {
        const tx = await createTransaction(user.uid, form);
        addTransaction(tx);
        showToast('Lançamento adicionado!', 'success');
      }
      onClose();
    } catch {
      showToast('Erro ao salvar lançamento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const title = editingTransaction
    ? `Editar — ${category.icon} ${category.name}`
    : `Novo lançamento — ${category.icon} ${category.name}`;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Subcategoria */}
        <div className={styles.field}>
          <label className={styles.label}>Subcategoria</label>
          <select
            className={styles.select}
            value={form.subcategoryId}
            onChange={(e) => setForm((f) => ({ ...f, subcategoryId: e.target.value }))}
          >
            <option value="">— Nenhuma (direto na categoria) —</option>
            {categorySubs.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Descrição *"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Ex: Supermercado Extra"
          error={errors.description}
          maxLength={100}
        />

        <Input
          label="Valor (R$) *"
          type="text"
          inputMode="decimal"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          placeholder="0,00"
          error={errors.amount}
          leftIcon="R$"
        />

        <Input
          label="Data *"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          error={errors.date}
        />

        <div className={styles.field}>
          <label className={styles.label}>Observação</label>
          <textarea
            className={styles.textarea}
            value={form.observation}
            onChange={(e) => setForm((f) => ({ ...f, observation: e.target.value }))}
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
            variant={category.type === 'income' ? 'income' : 'expense'}
            loading={loading}
          >
            {editingTransaction ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
