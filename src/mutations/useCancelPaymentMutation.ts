import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Input type for the cancel payment mutation
export interface CancelPaymentInput {
  idempotencyKey: string;
}

// Output type for the cancel payment mutation
export interface CancelPaymentOutput {
  success: boolean;
  message?: string;
}

// Function to call the cloud function
const cancelPayment = async (input: CancelPaymentInput): Promise<CancelPaymentOutput> => {
  const cancelPaymentCallable = httpsCallable<CancelPaymentInput, CancelPaymentOutput>(
    functions,
    'cancelPayment'
  );
  
  const result = await cancelPaymentCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCancelPaymentMutation = () => {
  return useMutation({
    mutationFn: cancelPayment,
  });
};