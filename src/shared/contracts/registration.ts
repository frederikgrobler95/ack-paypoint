export type Registration = {
  id: string;
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  createdAt: string; // ISO string
  idempotencyKey: string;
};