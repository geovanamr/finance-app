// ============================================================
// COMPONENTE: VaultEntryModal — formulário de depósito/retirada
// ============================================================

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useVaultStore } from '../../../store/vault.store';
import { useAuthStore } from '../../../store/auth.store';
import {
  createVaultEntry,
  createVaultWithdrawalWithExpense,
} from '../../../services/vault.service';
import { useToast } from '../../../components/ui/Toast';
import type { VaultEntryType } from '../../../types';
import styles from './VaultEntryModal.module.css';
import { getLocalISODate } from '../../../utils/date';
import { parseCurrencyInput } from '../../../utils/currency';
import { useCategoryStore } from '../../../store/category.store';
import { useTransactionStore } from '../../../store/transaction.store';

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
  const { addEntry, balance } = useVaultStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const subcategories = useTransactionStore((state) => state.subcategories);
  const categories = useCategoryStore((state) => state.categories);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getLocalISODate());
  const [observation, setObservation] = useState('');
  const [destination, setDestination] = useState<'expense' | 'unassigned'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDeposit = type === 'deposit';
  const title = isDeposit ? '⬇️ Depositar no Cofre' : '⬆️ Retirar do Cofre';
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const categorySubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === categoryId
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!description.trim()) e.description = 'Descrição obrigatória.';
    const parsedAmount = parseCurrencyInput(amount);
    if (!amount || parsedAmount <= 0)
      e.amount = 'Valor deve ser maior que zero.';
    else if (!isDeposit && parsedAmount > balance)
      e.amount = 'O valor da retirada é maior que o saldo do Cofre.';
    if (!date) e.date = 'Data obrigatória.';
    if (!isDeposit && destination === 'expense' && !categoryId)
      e.categoryId = 'Selecione a categoria do gasto.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;
    setLoading(true);
    try {
      if (!isDeposit && destination === 'expense') {
        const result = await createVaultWithdrawalWithExpense(user.uid, {
          categoryId,
          subcategoryId,
          amount,
          date,
          description,
          observation,
        });
        addEntry(result.entry);
        addTransaction(result.transaction);
        showToast('Retirada e gasto registrados!', 'success');
      } else {
        const entry = await createVaultEntry(user.uid, {
          type,
          amount,
          date,
          description,
          observation,
        });
        addEntry(entry);
        showToast(isDeposit ? 'Depósito registrado!' : 'Retirada registrada!', 'success');
      }
      onClose();
    } catch {
      showToast('Erro ao registrar movimentação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size={isDeposit ? 'sm' : 'md'}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {!isDeposit && (
          <fieldset className={styles.destinationGroup}>
            <legend className={styles.label}>O que será feito com o dinheiro?</legend>
            <label className={styles.destinationOption}>
              <input
                type="radio"
                name="destination"
                value="expense"
                checked={destination === 'expense'}
                onChange={() => setDestination('expense')}
              />
              <span>
                <strong>Pagar uma despesa</strong>
                <small>Cria também um gasto marcado como pago com o Cofre.</small>
              </span>
            </label>
            <label className={styles.destinationOption}>
              <input
                type="radio"
                name="destination"
                value="unassigned"
                checked={destination === 'unassigned'}
                onChange={() => {
                  setDestination('unassigned');
                  setErrors((current) => ({ ...current, categoryId: '' }));
                }}
              />
              <span>
                <strong>Apenas retirar do Cofre</strong>
                <small>Não cria uma receita nem um gasto mensal.</small>
              </span>
            </label>
          </fieldset>
        )}

        {!isDeposit && destination === 'expense' && (
          <div className={styles.expenseFields}>
            <div className={styles.field}>
              <label className={styles.label}>Categoria do gasto *</label>
              <select
                className={styles.select}
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId('');
                  setErrors((current) => ({ ...current, categoryId: '' }));
                }}
              >
                <option value="">Selecione...</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className={styles.error}>{errors.categoryId}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Subcategoria</label>
              <select
                className={styles.select}
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                disabled={!categoryId}
              >
                <option value="">— Nenhuma —</option>
                {categorySubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <Input
          label="Descrição *"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((current) => ({ ...current, description: '' }));
          }}
          placeholder={isDeposit ? 'Ex: Reserva do salário' : 'Ex: Compra do notebook'}
          error={errors.description}
          maxLength={100}
        />

        <Input
          label="Valor (R$) *"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setErrors((current) => ({ ...current, amount: '' }));
          }}
          placeholder="0,00"
          error={errors.amount}
          leftIcon="R$"
        />

        <Input
          label="Data *"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setErrors((current) => ({ ...current, date: '' }));
          }}
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
