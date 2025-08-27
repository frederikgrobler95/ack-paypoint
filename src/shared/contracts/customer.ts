export type Customer = {
  id: string;
  name: string;
  phoneE164: string;
  phoneRaw: string;
  qrCodeId: string;
  Account: Account;
  IdempotencyKey?: string;
};

export type AccountStatus = 'clean' |'unpaid' | 'paid';

export type Account = {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: Date;
};