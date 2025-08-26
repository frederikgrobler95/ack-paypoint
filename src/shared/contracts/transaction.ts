import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'debit' | 'credit' | 'refund';

export type Transaction = {
  id: string;
  accountId: string;
  stallId: string;
  operatorId: string;
  operatorName: string;
  amountCents: number;
  type: TransactionType;
  refundOfTxnId?: string;
  idempotencyKey: string;
  createdAt: Timestamp;
};