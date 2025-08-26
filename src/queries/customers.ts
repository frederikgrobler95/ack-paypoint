import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Customer } from '../shared/contracts/customer';

// Query keys for customer-related queries
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: string) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  byQRCode: (qrCodeId: string | null) => [...customerKeys.lists(), 'qrCode', qrCodeId] as const,
};

// Fetch a single customer by ID
export const fetchCustomer = async (id: string): Promise<Customer | null> => {
  return fetchDocument<Customer>('customers', id);
};

// Fetch customers by QR code ID with pagination
export const fetchCustomersByQRCode = async (qrCodeId: string | null, pageSize: number = 20, lastDocument?: any): Promise<{ data: Customer[]; lastDoc: any }> => {
  if (qrCodeId) {
    return fetchDocumentsPaginated<Customer>('customers', pageSize, lastDocument, [where('qrCodeId', '==', qrCodeId)]);
  }
  return fetchDocumentsPaginated<Customer>('customers', pageSize, lastDocument, [where('qrCodeId', '==', null)]);
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

// Get customers by QR code ID with pagination
export const useCustomersByQRCode = (qrCodeId: string | null, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: customerKeys.byQRCode(qrCodeId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchCustomersByQRCode(qrCodeId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: qrCodeId !== undefined,
  });
};

// Get customers by QR code ID (suspense version) with pagination
export const useSuspenseCustomersByQRCode = (qrCodeId: string | null, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: customerKeys.byQRCode(qrCodeId),
    queryFn: async () => {
      const result = await fetchCustomersByQRCode(qrCodeId, pageSize);
      return result.data;
    },
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