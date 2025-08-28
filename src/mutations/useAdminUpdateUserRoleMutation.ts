import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from '../shared/contracts/user';

// Input type for the admin update user role mutation
export interface AdminUpdateUserRoleInput {
  userId: string;
  role: 'admin' | 'member';
  tutorialMode?: boolean;
  tutorialEnabled?: boolean;
  tutorialCompleted?: boolean;
}

// Function to update user role directly
const adminUpdateUserRole = async (input: AdminUpdateUserRoleInput): Promise<{ success: boolean; message: string }> => {
  try {
    // Update the user document with the new role and tutorialMode
    const userDocRef = doc(db, 'users', input.userId);
    const updateData: any = {
      role: input.role,
      updatedAt: serverTimestamp(),
    };
    
    // Only include tutorialMode if it's provided
    if (input.tutorialMode !== undefined) {
      updateData.tutorialMode = input.tutorialMode;
    }
    
    // Only include tutorialEnabled if it's provided
    if (input.tutorialEnabled !== undefined) {
      updateData.tutorialEnabled = input.tutorialEnabled;
    }
    
    // Only include tutorialCompleted if it's provided
    if (input.tutorialCompleted !== undefined) {
      updateData.tutorialCompleted = input.tutorialCompleted;
    }
    
    await updateDoc(userDocRef, updateData);
    
    return { success: true, message: 'User updated successfully' };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, message: error.message || 'Failed to update user' };
  }
};

// React Query mutation hook
export const useAdminUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminUpdateUserRole,
    onSuccess: () => {
      // Invalidate users query to refetch data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};