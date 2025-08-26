import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const qrCodeStatusSchema = z.enum(['unassigned', 'assigned', 'void', 'lost']);

export const qrCodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: qrCodeStatusSchema,
  assignedCustomerId: z.string().nullable(),
  batchId: z.string().nullable(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export type QRCodeStatus = z.infer<typeof qrCodeStatusSchema>;
export type QRCode = z.infer<typeof qrCodeSchema>;

export const qrBatchSchema = z.object({
  id: z.string(),
  batchName: z.string(),
  createdAt: z.instanceof(Timestamp),
  generatedBy: z.string(), // userId
  count: z.number(),
});

export type QRBatch = z.infer<typeof qrBatchSchema>;