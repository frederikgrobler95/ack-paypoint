import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { Payment } from '../shared/contracts/payment';

// Input type for the create payment mutation
export interface CreatePaymentInput {
  method: string;
  amountCents: number;
  operatorId: string;
  operatorName?: string;
  customerId: string;
  customerName?: string;
  stallId: string;
  idempotencyKey: string;
}

// Output type for the create payment mutation
export interface CreatePaymentOutput {
  payment: Payment;
}

// Function to call the cloud function
const createPayment = async (input: CreatePaymentInput): Promise<CreatePaymentOutput> => {
  const createPaymentCallable = httpsCallable<CreatePaymentInput, CreatePaymentOutput>(
    functions,
    'createPayment'
  );
  
  const result = await createPaymentCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCreatePaymentMutation = () => {
  return useMutation({
    mutationFn: createPayment,
  });
};