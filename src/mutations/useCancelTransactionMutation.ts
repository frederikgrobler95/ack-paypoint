import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Input type for the cancel transaction mutation
export interface CancelTransactionInput {
  idempotencyKey: string;
}

// Output type for the cancel transaction mutation
export interface CancelTransactionOutput {
  success: boolean;
  message?: string;
}

// Function to call the cloud function
const cancelTransaction = async (input: CancelTransactionInput): Promise<CancelTransactionOutput> => {
  const cancelTransactionCallable = httpsCallable<CancelTransactionInput, CancelTransactionOutput>(
    functions,
    'cancelTransaction'
  );
  
  const result = await cancelTransactionCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCancelTransactionMutation = () => {
  return useMutation({
    mutationFn: cancelTransaction,
  });
};