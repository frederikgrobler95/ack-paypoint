import { Timestamp } from 'firebase/firestore';

export type Registration = {
  id: string;
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  createdAt: Timestamp;
  idempotencyKey: string;
};