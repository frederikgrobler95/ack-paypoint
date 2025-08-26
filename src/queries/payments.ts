import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Payment } from '../shared/contracts/payment';

// Query keys for payment-related queries
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: string) => [...paymentKeys.lists(), { filters }] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

// Fetch a single payment by ID
export const fetchPayment = async (id: string): Promise<Payment | null> => {
  return fetchDocument<Payment>('payments', id);
};

// Fetch payments by account ID
export const fetchPaymentsByAccount = async (accountId: string): Promise<Payment[]> => {
  return fetchDocuments<Payment>('payments', [where('accountId', '==', accountId)]);
};

// Fetch payments by operator ID
export const fetchPaymentsByOperator = async (operatorId: string): Promise<Payment[]> => {
  return fetchDocuments<Payment>('payments', [where('operatorId', '==', operatorId)]);
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

// Get payments by account ID
export const usePaymentsByAccount = (accountId: string) => {
  return useQuery({
    queryKey: [...paymentKeys.list(`account-${accountId}`), accountId],
    queryFn: () => fetchPaymentsByAccount(accountId),
    enabled: !!accountId,
  });
};

// Get payments by account ID (suspense version)
export const useSuspensePaymentsByAccount = (accountId: string) => {
  return useSuspenseQuery({
    queryKey: [...paymentKeys.list(`account-${accountId}`), accountId],
    queryFn: () => fetchPaymentsByAccount(accountId),
  });
};

// Get payments by operator ID
export const usePaymentsByOperator = (operatorId: string) => {
  return useQuery({
    queryKey: [...paymentKeys.list(`operator-${operatorId}`), operatorId],
    queryFn: () => fetchPaymentsByOperator(operatorId),
    enabled: !!operatorId,
  });
};

// Get payments by operator ID (suspense version)
export const useSuspensePaymentsByOperator = (operatorId: string) => {
  return useSuspenseQuery({
    queryKey: [...paymentKeys.list(`operator-${operatorId}`), operatorId],
    queryFn: () => fetchPaymentsByOperator(operatorId),
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