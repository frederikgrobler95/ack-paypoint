import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from '../shared/contracts/user';

// Input type for the admin update user role mutation
export interface AdminUpdateUserRoleInput {
  userId: string;
  role: 'admin' | 'member';
}

// Function to update user role directly
const adminUpdateUserRole = async (input: AdminUpdateUserRoleInput): Promise<{ success: boolean; message: string }> => {
  try {
    // Update the user document with the new role
    const userDocRef = doc(db, 'users', input.userId);
    await updateDoc(userDocRef, {
      role: input.role,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, message: 'User role updated successfully' };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, message: error.message || 'Failed to update user role' };
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