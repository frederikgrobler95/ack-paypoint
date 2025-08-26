export type StallType = 'registration' | 'checkout' | 'commerce';

export interface Stall {
  id: string;
  name: string;
  type: StallType;
  totalSalesAmountCents?: number; // Optional fixed amount for registration stalls
}