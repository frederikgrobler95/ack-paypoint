import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { QRCode } from '../shared/contracts/qrCode';

// Input type for the admin void customer QR mutation
export interface AdminVoidCustomerQrInput {
  qrCodeId: string;
}

// Function to void customer QR code directly
const adminVoidCustomerQr = async (input: AdminVoidCustomerQrInput): Promise<{ success: boolean; message: string }> => {
  try {
    // Update the QR code document to mark it as void
    const qrCodeDocRef = doc(db, 'qrCodes', input.qrCodeId);
    await updateDoc(qrCodeDocRef, {
      status: 'void',
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, message: 'QR code voided successfully' };
  } catch (error: any) {
    console.error('Error voiding QR code:', error);
    return { success: false, message: error.message || 'Failed to void QR code' };
  }
};

// React Query mutation hook
export const useAdminVoidCustomerQrMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminVoidCustomerQr,
    onSuccess: () => {
      // Invalidate QR codes query to refetch data
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};