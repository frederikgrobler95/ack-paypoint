import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

// Input type for the admin create customers report mutation
export interface AdminCreateCustomersReportInput {
  customerIds?: string[];
}

// Output type for the admin create customers report mutation
export interface AdminCreateCustomersReportOutput {
  data: string; // base64 encoded PDF
  success: boolean;
  message: string;
}

// Function to call the cloud function
const adminCreateCustomersReport = async (input: AdminCreateCustomersReportInput): Promise<AdminCreateCustomersReportOutput> => {
  const adminCreateCustomersReportCallable = httpsCallable<AdminCreateCustomersReportInput, AdminCreateCustomersReportOutput>(
    functions,
    'adminCreateCustomersReportPdf'
  );
  
  const result = await adminCreateCustomersReportCallable(input);
  return result.data;
};

// React Query mutation hook
export const useAdminCreateCustomersReportMutation = () => {
  return useMutation({
    mutationFn: adminCreateCustomersReport,
  });
};