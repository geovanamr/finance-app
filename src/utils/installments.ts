import { roundCurrency } from './currency';

/** Calcula o dia 01 do mês seguinte à compra. */
export const calcFirstInstallmentDate = (purchaseDate: string): string => {
  const [year, month] = purchaseDate.split('-').map(Number);
  const next = new Date(year, month, 1);
  const nextYear = next.getFullYear();
  const nextMonth = String(next.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}-01`;
};

/**
 * Distribui o total em centavos, garantindo que a soma das parcelas seja exata.
 * Eventuais centavos restantes são adicionados às primeiras parcelas.
 */
export const distributeInstallmentAmounts = (
  totalAmount: number,
  totalInstallments: number
): number[] => {
  const totalCents = Math.round(roundCurrency(totalAmount) * 100);

  if (!Number.isInteger(totalInstallments) || totalInstallments < 1 || totalInstallments > 360) {
    throw new Error('Número de parcelas inválido.');
  }
  if (totalCents < totalInstallments) {
    throw new Error('O valor total deve permitir parcelas de ao menos R$ 0,01.');
  }

  const baseCents = Math.floor(totalCents / totalInstallments);
  const remainderCents = totalCents % totalInstallments;

  return Array.from(
    { length: totalInstallments },
    (_, index) => (baseCents + (index < remainderCents ? 1 : 0)) / 100
  );
};
