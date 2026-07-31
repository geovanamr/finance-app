// ============================================================
// COMPONENTE: SubcategoryModal — formulário de nova subcategoria
// ============================================================

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTransactionStore } from '../../../store/transaction.store';
import { useAuthStore } from '../../../store/auth.store';
import { createSubcategory } from '../../../services/subcategory.service';
import { useToast } from '../../../components/ui/Toast';
import type { Category } from '../../../types';
import styles from './SubcategoryModal.module.css';

interface SubcategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: Category;
}

export const SubcategoryModal: React.FC<SubcategoryModalProps> = ({
  open,
  onClose,
  category,
}) => {
  const { addSubcategory } = useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      setError('Nome obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const sub = await createSubcategory(user.uid, {
        name: name.trim(),
        categoryId: category.id,
      });
      addSubcategory(sub);
      showToast(`Subcategoria "${sub.name}" criada!`, 'success');
      setName('');
      onClose();
    } catch {
      showToast('Erro ao criar subcategoria.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Nova subcategoria — ${category.icon} ${category.name}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Nome da subcategoria *"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="Ex: Manutenção em computador"
          error={error}
          autoFocus
          maxLength={60}
        />

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
