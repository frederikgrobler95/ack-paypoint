import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { Transaction } from '../shared/contracts/transaction';
import { customerKeys } from '../queries/customers';

// Input type for the create transaction mutation
export interface CreateTransactionInput {
  stallId: string;
  stallName?: string;
  operatorId: string;
  operatorName: string;
  customerId: string;
  customerName?: string;
  amountCents: number;
  type: 'sale' | 'refund';
  refundOfTxnId?: string;
  idempotencyKey: string;
}

// Output type for the create transaction mutation
export interface CreateTransactionOutput {
  transaction: Transaction;
}

// Function to call the cloud function
const createTransaction = async (input: CreateTransactionInput): Promise<CreateTransactionOutput> => {
  const createTransactionCallable = httpsCallable<{transaction: CreateTransactionInput}, CreateTransactionOutput>(
    functions,
    'createTransaction'
  );
  
  const result = await createTransactionCallable({transaction: input});
  return result.data;
};

// React Query mutation hook
export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (data, variables) => {
      // Invalidate the customer query to ensure fresh data is fetched
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId)
      });
    }
  });
};