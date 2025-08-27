import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { QRCode } from '../shared/contracts/qrCode';

// Input type for the admin reissue customer QR mutation
export interface AdminReissueCustomerQrInput {
  customerId: string;
  newQrCodeId: string;
}

// Function to reissue customer QR code directly
const adminReissueCustomerQr = async (input: AdminReissueCustomerQrInput): Promise<{ success: boolean; message: string }> => {
  try {
    // Update the customer document with the new QR code ID
    const customerDocRef = doc(db, 'customers', input.customerId);
    await updateDoc(customerDocRef, {
      qrCodeId: input.newQrCodeId,
      updatedAt: serverTimestamp(),
    });
    
    // Also update the QR code document to mark it as assigned
    const qrCodeDocRef = doc(db, 'qrCodes', input.newQrCodeId);
    await updateDoc(qrCodeDocRef, {
      assignedCustomerId: input.customerId,
      status: 'assigned',
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, message: 'QR code reissued successfully' };
  } catch (error: any) {
    console.error('Error reissuing QR code:', error);
    return { success: false, message: error.message || 'Failed to reissue QR code' };
  }
};

// React Query mutation hook
export const useAdminReissueCustomerQrMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminReissueCustomerQr,
    onSuccess: () => {
      // Invalidate customers and QR codes queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};