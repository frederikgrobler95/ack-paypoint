import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { Transaction } from '../shared/contracts/transaction';

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
  const createTransactionCallable = httpsCallable<CreateTransactionInput, CreateTransactionOutput>(
    functions,
    'createTransaction'
  );
  
  const result = await createTransactionCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCreateTransactionMutation = () => {
  return useMutation({
    mutationFn: createTransaction,
  });
};