import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { Customer } from '../shared/contracts/customer';
import { useSessionStore } from '../shared/stores/sessionStore';

// Input type for the create customer mutation
export interface CreateCustomerInput {
  customerName: string;
  phone: string;
  qrCodeId: string;
  stallId: string;
  idempotencyKey: string;
}

// Output type for the create customer mutation
export interface CreateCustomerOutput {
  customer: Customer;
}

// Function to call the cloud function
const createCustomer = async (input: CreateCustomerInput & { operatorName: string }): Promise<CreateCustomerOutput> => {
  const { customerName, phone, qrCodeId, stallId, idempotencyKey, operatorName } = input;

  const createCustomerCallable = httpsCallable<any, CreateCustomerOutput>(
    functions,
    'createCustomer'
  );

  const result = await createCustomerCallable({
    registration: {
      customerName,
      phone,
      qrCodeId,
      stallId,
      idempotencyKey,
      operatorName,
    }
  });
  return result.data;
};

// React Query mutation hook
export const useCreateCustomerMutation = () => {
  const displayName = useSessionStore((state) => state.displayName);

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer({
      ...input,
      operatorName: displayName || 'Unknown Operator'
    }),
  });
};