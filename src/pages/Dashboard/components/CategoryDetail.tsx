// ============================================================
// COMPONENTE: CategoryDetail
// Painel lateral/modal com transações e subcategorias de uma categoria.
// ============================================================

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useTransactionStore } from '../../../store/transaction.store';
import { useAuthStore } from '../../../store/auth.store';
import { deleteTransaction } from '../../../services/transaction.service';
import { deleteSubcategory } from '../../../services/subcategory.service';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { useToast } from '../../../components/ui/Toast';
import { TransactionModal } from './TransactionModal';
import { SubcategoryModal } from './SubcategoryModal';
import type { Category, Transaction, Subcategory } from '../../../types';
import styles from './CategoryDetail.module.css';

interface CategoryDetailProps {
  category: Category;
  monthKey: string;
  onClose: () => void;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  monthKey,
  onClose,
}) => {
  const { transactions, subcategories, removeTransaction, removeSubcategory } =
    useTransactionStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filtra dados desta categoria
  const categoryTxs = transactions.filter((tx) => tx.categoryId === category.id);
  const categorySubs = subcategories.filter((sub) => sub.categoryId === category.id);

  const getSubName = (subId?: string) =>
    categorySubs.find((s) => s.id === subId)?.name ?? 'Geral';

  const handleDeleteTx = async (tx: Transaction) => {
    if (!user) return;
    if (!confirm(`Excluir "${tx.description}"?`)) return;
    try {
      await deleteTransaction(user.uid, tx.id);
      removeTransaction(tx.id);
      showToast('Transação excluída.', 'success');
    } catch {
      showToast('Erro ao excluir transação.', 'error');
    }
  };

  const handleDeleteSub = async (sub: Subcategory) => {
    if (!user) return;
    if (!confirm(`Excluir subcategoria "${sub.name}"? As transações vinculadas não serão excluídas.`)) return;
    try {
      await deleteSubcategory(user.uid, sub.id);
      removeSubcategory(sub.id);
      showToast('Subcategoria excluída.', 'success');
    } catch {
      showToast('Erro ao excluir subcategoria.', 'error');
    }
  };

  const total = categoryTxs.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <>
      <Modal open onClose={onClose} title={`${category.icon} ${category.name}`} size="lg">
        {/* Total da categoria */}
        <div className={styles.totalBanner} style={{ borderColor: category.color }}>
          <span className={styles.totalLabel}>Total no mês</span>
          <span
            className={styles.totalValue}
            style={{ color: category.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}
          >
            {formatCurrency(total)}
          </span>
        </div>

        {/* Subcategorias */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Subcategorias</h3>
            <Button variant="ghost" size="sm" onClick={() => setSubModalOpen(true)}>
              + Nova
            </Button>
          </div>
          {categorySubs.length === 0 ? (
            <p className={styles.empty}>Nenhuma subcategoria criada.</p>
          ) : (
            <div className={styles.subList}>
              {categorySubs.map((sub) => {
                const subTotal = categoryTxs
                  .filter((tx) => tx.subcategoryId === sub.id)
                  .reduce((sum, tx) => sum + tx.amount, 0);
                return (
                  <div key={sub.id} className={styles.subItem}>
                    <span className={styles.subName}>{sub.name}</span>
                    <span className={styles.subTotal}>{formatCurrency(subTotal)}</span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteSub(sub)}
                      aria-label={`Excluir subcategoria ${sub.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transações */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Lançamentos</h3>
            <Button
              variant={category.type === 'income' ? 'income' : 'expense'}
              size="sm"
              onClick={() => { setEditingTx(null); setTxModalOpen(true); }}
            >
              + Adicionar
            </Button>
          </div>

          {categoryTxs.length === 0 ? (
            <p className={styles.empty}>Nenhum lançamento neste mês.</p>
          ) : (
            <div className={styles.txList}>
              {categoryTxs.map((tx) => (
                <div key={tx.id} className={styles.txItem}>
                  <div className={styles.txLeft}>
                    <span className={styles.txDate}>{formatDate(tx.date)}</span>
                    <span className={styles.txDesc}>{tx.description}</span>
                    <span className={styles.txSub}>{getSubName(tx.subcategoryId)}</span>
                    {tx.observation && (
                      <span className={styles.txObs}>{tx.observation}</span>
                    )}
                  </div>
                  <div className={styles.txRight}>
                    <span
                      className={styles.txAmount}
                      style={{
                        color:
                          category.type === 'income'
                            ? 'var(--color-income)'
                            : 'var(--color-expense)',
                      }}
                    >
                      {formatCurrency(tx.amount)}
                    </span>
                    <div className={styles.txActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => { setEditingTx(tx); setTxModalOpen(true); }}
                        aria-label="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteTx(tx)}
                        aria-label="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de transação */}
      {txModalOpen && (
        <TransactionModal
          open={txModalOpen}
          onClose={() => { setTxModalOpen(false); setEditingTx(null); }}
          category={category}
          monthKey={monthKey}
          editingTransaction={editingTx}
        />
      )}

      {/* Modal de subcategoria */}
      {subModalOpen && (
        <SubcategoryModal
          open={subModalOpen}
          onClose={() => setSubModalOpen(false)}
          category={category}
        />
      )}
    </>
  );
};
