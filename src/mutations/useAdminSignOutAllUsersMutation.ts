import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Output type for the admin sign out all users mutation
export interface AdminSignOutAllUsersOutput {
  success: boolean;
  message: string;
  usersAffected: number;
}

// Function to call the cloud function
const adminSignOutAllUsers = async (): Promise<AdminSignOutAllUsersOutput> => {
  const adminSignOutAllUsersCallable = httpsCallable<undefined, AdminSignOutAllUsersOutput>(
    functions,
    'adminSignOutAllUsers'
  );
  
  const result = await adminSignOutAllUsersCallable();
  return result.data;
};

// React Query mutation hook
export const useAdminSignOutAllUsersMutation = () => {
  return useMutation({
    mutationFn: adminSignOutAllUsers,
  });
};