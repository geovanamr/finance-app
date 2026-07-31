// ============================================================
// COMPONENTE: CategoryList — lista de categorias clicáveis
// ============================================================

import React, { useState } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../../config/categories';
import { useTransactionStore } from '../../../store/transaction.store';
import { usePrivacy } from '../../../context/PrivacyContext';
import { CategoryDetail } from './CategoryDetail';
import type { Category } from '../../../types';
import styles from './CategoryList.module.css';

interface CategoryListProps {
  monthKey: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ monthKey }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { transactions } = useTransactionStore();
  const { privateCurrency } = usePrivacy();

  const getTotalByCategory = (categoryId: string) =>
    transactions
      .filter((tx) => tx.categoryId === categoryId)
      .reduce((sum, tx) => sum + tx.amount, 0);

  const renderSection = (title: string, categories: Category[], type: 'income' | 'expense') => (
    <div className={styles.section}>
      <h2 className={[styles.sectionTitle, styles[type]].join(' ')}>
        {type === 'income' ? '💰' : '📊'} {title}
      </h2>
      <div className={styles.list}>
        {categories.map((category) => {
          const total = getTotalByCategory(category.id);
          return (
            <button
              key={category.id}
              className={styles.categoryItem}
              onClick={() => setSelectedCategory(category)}
              aria-label={`${category.name}: ${privateCurrency(total)}`}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
              <div className={styles.categoryRight}>
                <span
                  className={[
                    styles.categoryTotal,
                    total > 0 ? styles[type] : styles.zero,
                  ].join(' ')}
                >
                  {privateCurrency(total)}
                </span>
                <span className={styles.arrow}>›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.wrapper}>
        {renderSection('Receitas Mensais', INCOME_CATEGORIES, 'income')}
        {renderSection('Gastos Mensais', EXPENSE_CATEGORIES, 'expense')}
      </div>

      {selectedCategory && (
        <CategoryDetail
          category={selectedCategory}
          monthKey={monthKey}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </>
  );
};
