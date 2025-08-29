import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Customer } from '../shared/contracts/customer';

// Input type for the admin create customers mutation
export interface AdminCreateCustomerInput {
  name: string;
  phone: string;
  qrCodeId: string;
  idempotencyKey: string;
}

// Function to create customer documents directly
const adminCreateCustomers = async (customers: AdminCreateCustomerInput[]): Promise<Customer[]> => {
  const createdCustomers: Customer[] = [];
  
  // Process each customer in the list
  for (const customerInput of customers) {
    // Generate a new customer ID
    const customerId = doc(collection(db, 'customers')).id;
    
    // Create the customer document
    const customerData: Customer = {
      id: customerId,
      name: customerInput.name,
      phone: customerInput.phone,
      qrCodeId: customerInput.qrCodeId,
      Account: {
        balanceCents: 0,
        status: 'clean',
        lastPaidAt: Timestamp.now(),
      },
      idempotencyKey: customerInput.idempotencyKey,
    };
    
    // Save the customer document
    const customerDocRef = doc(db, 'customers', customerId);
    await setDoc(customerDocRef, customerData);
    
    // Add to the list of created customers
    createdCustomers.push(customerData);
  }
  
  return createdCustomers;
};

// React Query mutation hook
export const useAdminCreateCustomersMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminCreateCustomers,
    onSuccess: () => {
      // Invalidate customers query to refetch data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};