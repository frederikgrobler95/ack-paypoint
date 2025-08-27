import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { QRCode } from '../shared/contracts/qrCode';

// Input type for the admin create QR codes mutation
export interface AdminCreateQrCodesInput {
  amount: number;
  batchId?: string;
  name?: string;
  prefix?: string;
}

// Output type for the admin create QR codes mutation
export interface AdminCreateQrCodesOutput {
  qrCodes: QRCode[];
  batchId: string;
}

// Function to call the cloud function
const adminCreateQrCodes = async (input: AdminCreateQrCodesInput): Promise<AdminCreateQrCodesOutput> => {
  const adminCreateQrCodesCallable = httpsCallable<AdminCreateQrCodesInput, AdminCreateQrCodesOutput>(
    functions,
    'adminCreateQrCodes'
  );
  
  const result = await adminCreateQrCodesCallable(input);
  return result.data;
};

// React Query mutation hook
export const useAdminCreateQrCodesMutation = () => {
  return useMutation({
    mutationFn: adminCreateQrCodes,
  });
};