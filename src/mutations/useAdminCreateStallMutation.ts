import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Stall } from '../shared/contracts/stall';

// Input type for the admin create stall mutation
export interface AdminCreateStallInput {
  name: string;
  type: 'registration' | 'checkout' | 'commerce';
  totalAmount?: number; // Optional fixed amount for registration stalls
}

// Function to create stall documents directly
const adminCreateStall = async (stallInput: AdminCreateStallInput): Promise<Stall> => {
  // Generate a new stall ID
  const stallId = doc(collection(db, 'stalls')).id;
  
  // Create the stall document
  const stallData: Stall = {
    id: stallId,
    name: stallInput.name,
    type: stallInput.type,
    totalAmount: stallInput.totalAmount || 0,
  };
  
  // Save the stall document
  const stallDocRef = doc(db, 'stalls', stallId);
  await setDoc(stallDocRef, stallData);
  
  return stallData;
};

// React Query mutation hook
export const useAdminCreateStallMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminCreateStall,
    onSuccess: () => {
      // Invalidate stalls query to refetch data
      queryClient.invalidateQueries({ queryKey: ['stalls'] });
    },
  });
};