export type PaymentMethod = 'card' | 'cash';

export type Payment = {
  id: string;
  accountId: string;
  method: PaymentMethod;
  amountCents: number;
  operatorId: string;
  idempotencyKey: string;
  createdAt: Date;
};