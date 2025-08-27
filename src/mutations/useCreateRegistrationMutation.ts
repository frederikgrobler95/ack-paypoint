import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Registration } from '../shared/contracts/registration';

// Input type for the create registration mutation
export interface CreateRegistrationInput {
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  idempotencyKey: string;
}

// Function to create registration documents directly
const createRegistration = async (input: CreateRegistrationInput): Promise<Registration> => {
  // Generate a new registration ID
  const registrationId = doc(collection(db, 'registrations')).id;
  
  // Create the registration document
  const registrationData: Registration = {
    id: registrationId,
    operatorName: input.operatorName,
    stallId: input.stallId,
    customerId: input.customerId,
    customerName: input.customerName,
    qrCodeId: input.qrCodeId,
    createdAt: Timestamp.now(),
    idempotencyKey: input.idempotencyKey,
  };
  
  // Save the registration document
  const registrationDocRef = doc(db, 'registrations', registrationId);
  await setDoc(registrationDocRef, registrationData);
  
  return registrationData;
};

// React Query mutation hook
export const useCreateRegistrationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRegistration,
    onSuccess: () => {
      // Invalidate registrations query to refetch data
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
};