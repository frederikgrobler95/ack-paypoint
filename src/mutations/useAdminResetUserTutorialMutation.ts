import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

// Input type for the admin reset user tutorial mutation
export interface AdminResetUserTutorialInput {
  userId: string;
}

// Function to reset user tutorial
const adminResetUserTutorial = async (input: AdminResetUserTutorialInput): Promise<{ success: boolean; message: string }> => {
  try {
    // Update the user document to reset tutorial status
    const userDocRef = doc(db, 'users', input.userId);
    await updateDoc(userDocRef, {
      tutorialEnabled: true,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, message: 'User tutorial reset successfully' };
  } catch (error: any) {
    console.error('Error resetting user tutorial:', error);
    return { success: false, message: error.message || 'Failed to reset user tutorial' };
  }
};

// React Query mutation hook
export const useAdminResetUserTutorialMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminResetUserTutorial,
    onSuccess: () => {
      // Invalidate users query to refetch data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Also invalidate single user query if it exists
      queryClient.invalidateQueries({ queryKey: ['users', 'detail'] });
    },
  });
};