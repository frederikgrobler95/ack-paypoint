import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Input type for the cancel registration mutation
export interface CancelRegistrationInput {
  idempotencyKey: string;
}

// Output type for the cancel registration mutation
export interface CancelRegistrationOutput {
  success: boolean;
  message?: string;
}

// Function to call the cloud function
const cancelRegistration = async (input: CancelRegistrationInput): Promise<CancelRegistrationOutput> => {
  const cancelRegistrationCallable = httpsCallable<CancelRegistrationInput, CancelRegistrationOutput>(
    functions,
    'cancelRegistration'
  );
  
  const result = await cancelRegistrationCallable(input);
  return result.data;
};

// React Query mutation hook
export const useCancelRegistrationMutation = () => {
  return useMutation({
    mutationFn: cancelRegistration,
  });
};