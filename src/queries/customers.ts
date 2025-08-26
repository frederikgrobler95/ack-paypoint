import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Customer } from '../shared/contracts/customer';

// Query keys for customer-related queries
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: string) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Fetch a single customer by ID
export const fetchCustomer = async (id: string): Promise<Customer | null> => {
  return fetchDocument<Customer>('customers', id);
};

// Fetch customers by QR code ID
export const fetchCustomersByQrCode = async (qrCodeId: string): Promise<Customer[]> => {
  return fetchDocuments<Customer>('customers', [where('qrCodeId', '==', qrCodeId)]);
};

// Fetch all customers with pagination
export const fetchCustomers = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<Customer>('customers', pageSize, lastDocument);
};

// React Query hooks for customers

// Get a single customer by ID
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
  });
};

// Get a single customer by ID (suspense version)
export const useSuspenseCustomer = (id: string) => {
  return useSuspenseQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomer(id),
  });
};

// Get customers by QR code ID
export const useCustomersByQrCode = (qrCodeId: string) => {
  return useQuery({
    queryKey: [...customerKeys.list(`qrCode-${qrCodeId}`), qrCodeId],
    queryFn: () => fetchCustomersByQrCode(qrCodeId),
    enabled: !!qrCodeId,
  });
};

// Get customers by QR code ID (suspense version)
export const useSuspenseCustomersByQrCode = (qrCodeId: string) => {
  return useSuspenseQuery({
    queryKey: [...customerKeys.list(`qrCode-${qrCodeId}`), qrCodeId],
    queryFn: () => fetchCustomersByQrCode(qrCodeId),
  });
};

// Get all customers with infinite scrolling
export const useCustomers = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: customerKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchCustomers(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Prefetch customer data
export const usePrefetchCustomer = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: customerKeys.detail(id),
      queryFn: () => fetchCustomer(id),
    });
  };
};