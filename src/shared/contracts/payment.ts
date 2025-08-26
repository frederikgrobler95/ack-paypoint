export type PaymentMethod = 'card' | 'cash' | 'eft';

export type Payment = {
  id: string;
  method: PaymentMethod;
  amountCents: number;
  operatorId: string;
  operatorName?: string;
  customerId: string;
  customerName?: string;
  idempotencyKey: string;
  createdAt: Date;
};