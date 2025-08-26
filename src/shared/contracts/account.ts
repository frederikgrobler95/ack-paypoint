export type AccountStatus = 'unpaid' | 'paid';

export type Account = {
  id: string;
  customerId: string;
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt?: Date;
};