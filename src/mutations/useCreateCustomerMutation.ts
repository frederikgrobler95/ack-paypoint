import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { Customer } from '../shared/contracts/customer';

// Input type for the create customer mutation
export interface CreateCustomerInput {
  name: string;
  phoneE164: string;
  phoneRaw: string;
  qrCodeId: string;
  stallId: string;
  idempotencyKey: string;
}

// Output type for the create customer mutation
export interface CreateCustomerOutput {
  customer: Customer;
}

// Function to call the cloud function
const createCustomer = async (input: CreateCustomerInput): Promise<CreateCustomerOutput> => {
  const createCustomerCallable = httpsCallable<CreateCustomerInput, CreateCustomerOutput>(
    functions,
    'createCustomer'
  );
  
  const result = await createCustomerCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCreateCustomerMutation = () => {
  return useMutation({
    mutationFn: createCustomer,
  });
};