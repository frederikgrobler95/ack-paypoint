import { Transaction } from '@/shared/contracts/transaction';
import { Customer } from '@/shared/contracts/customer';
import { Stall } from '@/shared/contracts/stall';

// Calculate total sales from transactions
export const calculateTotalSales = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.type === 'sale')
    .reduce((total, transaction) => total + transaction.amountCents, 0);
};

// Calculate total checkouts (number of sale transactions)
export const calculateTotalCheckouts = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.type === 'sale')
    .length;
};

// Calculate customers registered (number of customers with QR codes)
export const calculateCustomersRegistered = (customers: Customer[]): number => {
  return customers.length;
};

// Find top performing stall based on total sales
export const findTopPerformingStall = (transactions: Transaction[], stalls: Stall[]): { stall: Stall | null, salesCents: number } => {
  // Group transactions by stallId and calculate total sales for each stall
  const stallSalesMap = transactions
    .filter(transaction => transaction.type === 'sale')
    .reduce((acc, transaction) => {
      const stallId = transaction.stallId;
      if (!acc[stallId]) {
        acc[stallId] = 0;
      }
      acc[stallId] += transaction.amountCents;
      return acc;
    }, {} as Record<string, number>);

  // Find the stall with the highest sales
  let topStallId: string | null = null;
  let maxSales = 0;

  for (const [stallId, sales] of Object.entries(stallSalesMap)) {
    if (sales > maxSales) {
      topStallId = stallId;
      maxSales = sales;
    }
  }

  // Find the stall object
  const topStall = topStallId ? stalls.find(stall => stall.id === topStallId) || null : null;

  return {
    stall: topStall,
    salesCents: maxSales
  };
};