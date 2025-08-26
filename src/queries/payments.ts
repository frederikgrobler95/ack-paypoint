import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Payment } from '../shared/contracts/payment';

// Query keys for payment-related queries
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: string) => [...paymentKeys.lists(), { filters }] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byOperator: (operatorId: string) => [...paymentKeys.lists(), 'operator', operatorId] as const,
  byCustomer: (customerId: string) => [...paymentKeys.lists(), 'customer', customerId] as const,
};

// Fetch a single payment by ID
export const fetchPayment = async (id: string): Promise<Payment | null> => {
  return fetchDocument<Payment>('payments', id);
};

// Fetch payments by operator ID with pagination
export const fetchPaymentsByOperator = async (operatorId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Payment[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Payment>('payments', pageSize, lastDocument, [where('operatorId', '==', operatorId)]);
};

// Fetch payments by customer ID with pagination
export const fetchPaymentsByCustomer = async (customerId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Payment[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Payment>('payments', pageSize, lastDocument, [where('customerId', '==', customerId)]);
};

// Fetch all payments with pagination
export const fetchPayments = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<Payment>('payments', pageSize, lastDocument);
};

// React Query hooks for payments

// Get a single payment by ID
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
    enabled: !!id,
  });
};

// Get a single payment by ID (suspense version)
export const useSuspensePayment = (id: string) => {
  return useSuspenseQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
  });
};

// Get payments by operator ID with pagination
export const usePaymentsByOperator = (operatorId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: paymentKeys.byOperator(operatorId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchPaymentsByOperator(operatorId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!operatorId,
  });
};

// Get payments by operator ID (suspense version) with pagination
export const useSuspensePaymentsByOperator = (operatorId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: paymentKeys.byOperator(operatorId),
    queryFn: async () => {
      const result = await fetchPaymentsByOperator(operatorId, pageSize);
      return result.data;
    },
  });
};

// Get payments by customer ID with pagination
export const usePaymentsByCustomer = (customerId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: paymentKeys.byCustomer(customerId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchPaymentsByCustomer(customerId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!customerId,
  });
};

// Get payments by customer ID (suspense version) with pagination
export const useSuspensePaymentsByCustomer = (customerId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: paymentKeys.byCustomer(customerId),
    queryFn: async () => {
      const result = await fetchPaymentsByCustomer(customerId, pageSize);
      return result.data;
    },
  });
};

// Get all payments with infinite scrolling
export const usePayments = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: paymentKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchPayments(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Prefetch payment data
export const usePrefetchPayment = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: paymentKeys.detail(id),
      queryFn: () => fetchPayment(id),
    });
  };
};