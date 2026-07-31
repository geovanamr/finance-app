// ============================================================
// COMPONENTE: Modal
// Acessível, com foco preso e fechamento por Escape/backdrop.
// ============================================================

import React, { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

const modalStack: symbol[] = [];
let bodyOverflowBeforeModals = '';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(Symbol('modal'));
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const token = tokenRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (modalStack.length === 0) {
      bodyOverflowBeforeModals = document.body.style.overflow;
    }
    modalStack.push(token);
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true');

    const handleKey = (e: KeyboardEvent) => {
      if (modalStack.at(-1) !== token) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          dialogRef.current?.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    const focusable = getFocusableElements();
    (focusable[0] ?? dialogRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      const index = modalStack.lastIndexOf(token);
      if (index >= 0) modalStack.splice(index, 1);
      if (modalStack.length === 0) {
        document.body.style.overflow = bodyOverflowBeforeModals;
      }
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={[styles.modal, styles[size]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
