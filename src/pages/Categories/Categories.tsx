import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth.store';
import { useCategoryStore } from '../../store/category.store';
import { deleteCategory } from '../../services/category.service';
import { CategoryModal } from './components/CategoryModal';
import type { Category, TransactionType } from '../../types';
import styles from './Categories.module.css';

export const Categories: React.FC = () => {
  const { categories, loading, removeCategory } = useCategoryStore();
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openNew = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!user || !confirm(`Excluir a categoria "${category.name}"?`)) return;
    try {
      await deleteCategory(user.uid, category.id);
      removeCategory(category.id);
      showToast('Categoria excluída.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao excluir categoria.',
        'error'
      );
    }
  };

  const renderSection = (title: string, type: TransactionType) => {
    const items = categories.filter((category) => category.type === type);
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {items.length === 0 ? (
          <p className={styles.empty}>Nenhuma categoria cadastrada.</p>
        ) : (
          <div className={styles.list}>
            {items.map((category) => (
              <div key={category.id} className={styles.item}>
                <span
                  className={styles.icon}
                  style={{ backgroundColor: `${category.color}22`, color: category.color }}
                >
                  {category.icon}
                </span>
                <div className={styles.info}>
                  <strong>{category.name}</strong>
                  <span>{type === 'income' ? 'Receita' : 'Despesa'}</span>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => openEdit(category)} aria-label={`Editar ${category.name}`}>
                    ✏️
                  </button>
                  <button onClick={() => void handleDelete(category)} aria-label={`Excluir ${category.name}`}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Categorias</h1>
          <p>Organize as categorias usadas nos seus lançamentos.</p>
        </div>
        <Button onClick={openNew}>+ Nova categoria</Button>
      </div>

      {loading ? (
        <div className={styles.loading}><LoadingSpinner size="lg" /></div>
      ) : (
        <div className={styles.grid}>
          {renderSection('💰 Receitas', 'income')}
          {renderSection('📊 Despesas', 'expense')}
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          open
          category={editingCategory}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
