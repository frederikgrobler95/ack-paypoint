import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { PaymentMethod } from '../shared/contracts/payment';

// Input type for the checkout mutation
export interface CheckoutCustomerInput {
  method: PaymentMethod;
  amountCents: number;
  operatorId: string;
  customerId: string;
  idempotencyKey: string;
  operatorName?: string;
  customerName?: string;
}

// Output type for the checkout mutation
export interface CheckoutCustomerOutput {
  paymentId: string;
  customerId: string;
  amountCents: number;
  method: PaymentMethod;
  createdAt: Date;
}

// Function to call the cloud function
const checkoutCustomer = async (input: CheckoutCustomerInput): Promise<CheckoutCustomerOutput> => {
  const checkoutCustomerCallable = httpsCallable<CheckoutCustomerInput, CheckoutCustomerOutput>(
    functions,
    'checkoutCustomer'
  );
  
  const result = await checkoutCustomerCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCheckoutCustomerMutation = () => {
  return useMutation({
    mutationFn: checkoutCustomer,
  });
};