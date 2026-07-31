import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/auth.store';
import { useCategoryStore } from '../../../store/category.store';
import { createCategory, updateCategory } from '../../../services/category.service';
import { useToast } from '../../../components/ui/Toast';
import type { Category, CategoryFormData } from '../../../types';
import styles from './CategoryModal.module.css';

interface CategoryModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ open, category, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const { categories, addCategory, updateCategory: updateCategoryStore } = useCategoryStore();
  const { showToast } = useToast();
  const [form, setForm] = useState<CategoryFormData>(() => ({
    name: category?.name ?? '',
    type: category?.type ?? 'expense',
    icon: category?.icon ?? '📦',
    color: category?.color ?? '#5b6af5',
  }));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!form.name.trim() || !form.icon.trim()) {
      setError('Preencha o nome e o ícone.');
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await updateCategory(user.uid, category.id, form);
        updateCategoryStore(category.id, form);
        showToast('Categoria atualizada.', 'success');
      } else {
        const nextOrder = Math.max(0, ...categories.map((item) => item.order)) + 1;
        const created = await createCategory(user.uid, form, nextOrder);
        addCategory(created);
        showToast('Categoria criada.', 'success');
      }
      onClose();
    } catch (saveError) {
      showToast(
        saveError instanceof Error ? saveError.message : 'Erro ao salvar categoria.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Editar categoria' : 'Nova categoria'}
      size="sm"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome *"
          value={form.name}
          onChange={(event) => {
            setForm((current) => ({ ...current, name: event.target.value }));
            setError('');
          }}
          error={error}
          maxLength={60}
          autoFocus
        />

        <div className={styles.row}>
          <Input
            label="Ícone *"
            value={form.icon}
            onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
            maxLength={4}
          />
          <div className={styles.field}>
            <label htmlFor="category-color">Cor</label>
            <input
              id="category-color"
              className={styles.color}
              type="color"
              value={form.color}
              onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="category-type">Tipo *</label>
          <select
            id="category-type"
            className={styles.select}
            value={form.type}
            onChange={(event) => setForm((current) => ({
              ...current,
              type: event.target.value as CategoryFormData['type'],
            }))}
            disabled={!!category}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
          {category && <span className={styles.hint}>O tipo não pode ser alterado após a criação.</span>}
        </div>

        <div className={styles.buttons}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};
