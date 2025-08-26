import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'sale' | 'refund';

export type Transaction = {
  id: string;
  stallId: string;
  stallName?: string;
  operatorId: string;
  operatorName: string;
  customerId: string;
  customerName?: string;
  amountCents: number;
  type: TransactionType;
  refundOfTxnId?: string;
  idempotencyKey: string;
  createdAt: Timestamp;
};