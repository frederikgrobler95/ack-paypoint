import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Input type for the admin create stalls report mutation
export interface AdminCreateStallsReportInput {
  stallIds?: string[];
}

// Output type for the admin create stalls report mutation
export interface AdminCreateStallsReportOutput {
  data: string; // base64 encoded PDF
  success: boolean;
  message: string;
}

// Function to call the cloud function
const adminCreateStallsReport = async (input: AdminCreateStallsReportInput): Promise<AdminCreateStallsReportOutput> => {
  const adminCreateStallsReportCallable = httpsCallable<AdminCreateStallsReportInput, AdminCreateStallsReportOutput>(
    functions,
    'adminCreateStallsReportPdf'
  );
  
  const result = await adminCreateStallsReportCallable(input);
  return result.data;
};

// React Query mutation hook
export const useAdminCreateStallsReportMutation = () => {
  return useMutation({
    mutationFn: adminCreateStallsReport,
  });
};