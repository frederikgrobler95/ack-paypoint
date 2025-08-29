import { Timestamp } from 'firebase/firestore';

export type Customer = {
  id: string;
  name: string;
  phone: string;
  qrCodeId: string;
  Account: Account;
  idempotencyKey?: string;
};

export type AccountStatus = 'clean' |'unpaid' | 'paid';

export type Account = {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: Timestamp;
};