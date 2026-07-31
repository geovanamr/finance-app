// ============================================================
// COMPONENTE: Card
// ============================================================

import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: 'income' | 'expense' | 'primary' | 'warning';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  accent,
  padding = 'md',
}) => {
  const classes = [
    styles.card,
    accent ? styles[`accent-${accent}`] : '',
    styles[`padding-${padding}`],
    onClick ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <div
        className={classes}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
};
