import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Input type for the admin create QR codes PDF mutation
export interface AdminCreateQrCodesPdfInput {
  batchId?: string;
  qrId?: string;
}

// Output type for the admin create QR codes PDF mutation
export interface AdminCreateQrCodesPdfOutput {
  data: string; // base64 encoded PDF
  success: boolean;
  message: string;
}

// Function to call the cloud function
const adminCreateQrCodesPdf = async (input: AdminCreateQrCodesPdfInput): Promise<AdminCreateQrCodesPdfOutput> => {
  const adminCreateQrCodesPdfCallable = httpsCallable<AdminCreateQrCodesPdfInput, AdminCreateQrCodesPdfOutput>(
    functions,
    'adminCreateQrCodesPdf'
  );
  
  const result = await adminCreateQrCodesPdfCallable(input);
  return result.data;
};

// React Query mutation hook
export const useAdminCreateQrCodesPdfMutation = () => {
  return useMutation({
    mutationFn: adminCreateQrCodesPdf,
  });
};