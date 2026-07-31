// ============================================================
// COMPONENTE: InstallmentModal — lançamentos futuros parcelados
// ============================================================

import React, { useState, useCallback } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTransactionStore } from '../../../store/transaction.store';
import { useAuthStore } from '../../../store/auth.store';
import { createInstallmentPlan } from '../../../services/installment.service';
import { useToast } from '../../../components/ui/Toast';
import type { InstallmentFormData } from '../../../types';
import styles from './InstallmentModal.module.css';
import { getLocalISODate } from '../../../utils/date';
import { parseCurrencyInput } from '../../../utils/currency';
import { calcFirstInstallmentDate, distributeInstallmentAmounts } from '../../../utils/installments';
import { useCategoryStore } from '../../../store/category.store';

interface InstallmentModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM: InstallmentFormData = {
  categoryId: '',
  subcategoryId: '',
  description: '',
  totalAmount: '',
  installmentAmount: '',
  totalInstallments: '',
  purchaseDate: getLocalISODate(),
  observation: '',
};

export const InstallmentModal: React.FC<InstallmentModalProps> = ({ open, onClose }) => {
  const { subcategories, addTransaction } = useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const categories = useCategoryStore((state) => state.categories);
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const incomeCategories = categories.filter((category) => category.type === 'income');

  const [form, setForm] = useState<InstallmentFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InstallmentFormData, string>>>({});

  // Subcategorias filtradas pela categoria selecionada
  const categorySubs = subcategories.filter((s) => s.categoryId === form.categoryId);

  // Calcula a data da primeira parcela ao mudar a data de compra
  const firstInstallmentDate = form.purchaseDate
    ? calcFirstInstallmentDate(form.purchaseDate)
    : '';

  // Recalcula o valor da parcela automaticamente quando muda total ou qtd parcelas
  const recalcInstallment = useCallback(
    (totalAmount: string, totalInstallments: string) => {
      const total = parseCurrencyInput(totalAmount);
      const qty = Number(totalInstallments);
      if (!isNaN(total) && total > 0 && !isNaN(qty) && qty > 0) {
        return (total / qty).toFixed(2).replace('.', ',');
      }
      return '';
    },
    []
  );

  const handleTotalAmountChange = (value: string) => {
    const newInstallment = recalcInstallment(value, form.totalInstallments);
    setForm((f) => ({ ...f, totalAmount: value, installmentAmount: newInstallment }));
  };

  const handleInstallmentsChange = (value: string) => {
    const newInstallment = recalcInstallment(form.totalAmount, value);
    setForm((f) => ({ ...f, totalInstallments: value, installmentAmount: newInstallment }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setForm((f) => ({ ...f, categoryId, subcategoryId: '' }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.categoryId) newErrors.categoryId = 'Selecione uma categoria.';
    if (!form.description.trim()) newErrors.description = 'Descrição obrigatória.';
    if (!form.totalAmount || parseCurrencyInput(form.totalAmount) <= 0)
      newErrors.totalAmount = 'Valor total deve ser maior que zero.';
    const installmentCount = Number(form.totalInstallments);
    if (!Number.isInteger(installmentCount) || installmentCount < 1)
      newErrors.totalInstallments = 'Informe ao menos 1 parcela.';
    if (installmentCount > 360)
      newErrors.totalInstallments = 'O limite é de 360 parcelas.';
    if (!form.installmentAmount || parseCurrencyInput(form.installmentAmount) <= 0)
      newErrors.installmentAmount = 'Valor da parcela inválido.';
    if (!form.purchaseDate) newErrors.purchaseDate = 'Data da compra obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;

    setLoading(true);
    try {
      const { transactions } = await createInstallmentPlan(user.uid, form);
      // Adiciona ao store apenas as parcelas do mês atual visível
      transactions.forEach(addTransaction);
      showToast(
        `${transactions.length} parcela${transactions.length > 1 ? 's' : ''} criada${transactions.length > 1 ? 's' : ''} com sucesso!`,
        'success'
      );
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar parcelamento.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Preview das parcelas geradas
  const previewInstallments = () => {
    const qty = Number(form.totalInstallments);
    const desc = form.description.trim();
    const total = parseCurrencyInput(form.totalAmount);
    if (!qty || !desc || !firstInstallmentDate || total <= 0) return [];

    let amounts: number[];
    try {
      amounts = distributeInstallmentAmounts(total, qty);
    } catch {
      return [];
    }

    const [fy, fm] = firstInstallmentDate.split('-').map(Number);
    return Array.from({ length: Math.min(qty, 4) }, (_, i) => {
      const d = new Date(fy, fm - 1 + i, 1);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      return {
        label: `${i + 1}/${qty} ${desc}`,
        month: monthLabel,
        amount: amounts[i],
      };
    });
  };

  const preview = previewInstallments();
  const qty = parseInt(form.totalInstallments, 10);
  const showEllipsis = !isNaN(qty) && qty > 4;

  return (
    <Modal open={open} onClose={onClose} title="📅 Lançamento Futuro Parcelado" size="lg">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Linha 1: Categoria + Subcategoria */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Categoria *</label>
            <select
              className={`${styles.select} ${errors.categoryId ? styles.selectError : ''}`}
              value={form.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">— Selecione —</option>
              <optgroup label="Despesas">
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Receitas">
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.categoryId && <span className={styles.error}>{errors.categoryId}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Subcategoria</label>
            <select
              className={styles.select}
              value={form.subcategoryId}
              onChange={(e) => setForm((f) => ({ ...f, subcategoryId: e.target.value }))}
              disabled={!form.categoryId || categorySubs.length === 0}
            >
              <option value="">— Nenhuma —</option>
              {categorySubs.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descrição */}
        <Input
          label="Descrição *"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Ex: Celular, Notebook, Viagem..."
          error={errors.description}
          maxLength={80}
        />

        {/* Linha 2: Data da compra + Primeira parcela (readonly) */}
        <div className={styles.row}>
          <Input
            label="Data da compra *"
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
            error={errors.purchaseDate}
          />
          <div className={styles.field}>
            <label className={styles.label}>Primeira parcela</label>
            <input
              className={`${styles.input} ${styles.inputReadonly}`}
              type="text"
              value={
                firstInstallmentDate
                  ? new Date(firstInstallmentDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'
              }
              readOnly
              tabIndex={-1}
            />
            <span className={styles.hint}>Sempre dia 01 do mês seguinte</span>
          </div>
        </div>

        {/* Linha 3: Valor total + Nº parcelas + Valor por parcela */}
        <div className={styles.row3}>
          <Input
            label="Valor total (R$) *"
            type="text"
            inputMode="decimal"
            value={form.totalAmount}
            onChange={(e) => handleTotalAmountChange(e.target.value)}
            placeholder="0,00"
            error={errors.totalAmount}
            leftIcon="R$"
          />
          <Input
            label="Nº de parcelas *"
            type="number"
            inputMode="numeric"
            value={form.totalInstallments}
            onChange={(e) => handleInstallmentsChange(e.target.value)}
            placeholder="Ex: 10"
            error={errors.totalInstallments}
            min="1"
            max="360"
          />
          <Input
            label="Valor por parcela (R$) *"
            type="text"
            inputMode="decimal"
            value={form.installmentAmount}
            placeholder="0,00"
            error={errors.installmentAmount}
            leftIcon="R$"
            readOnly
          />
        </div>

        {/* Observação */}
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

        {/* Preview das parcelas */}
        {preview.length > 0 && (
          <div className={styles.preview}>
            <p className={styles.previewTitle}>Prévia dos lançamentos</p>
            <ul className={styles.previewList}>
              {preview.map((item, i) => (
                <li key={i} className={styles.previewItem}>
                  <span className={styles.previewLabel}>{item.label}</span>
                  <span className={styles.previewMeta}>
                    {item.month} &middot; R$ {item.amount.toFixed(2).replace('.', ',')}
                  </span>
                </li>
              ))}
              {showEllipsis && (
                <li className={styles.previewEllipsis}>
                  + {qty - 4} parcela{qty - 4 > 1 ? 's' : ''} restante{qty - 4 > 1 ? 's' : ''}...
                </li>
              )}
            </ul>
          </div>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="expense" loading={loading}>
            Criar parcelamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
