import { useQuery, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Account } from '../shared/contracts/account';

// Query keys for account-related queries
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters: string) => [...accountKeys.lists(), { filters }] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

// Fetch a single account by ID
export const fetchAccount = async (id: string): Promise<Account | null> => {
  return fetchDocument<Account>('accounts', id);
};

// Fetch accounts by customer ID
export const fetchAccountsByCustomer = async (customerId: string): Promise<Account[]> => {
  return fetchDocuments<Account>('accounts', [where('customerId', '==', customerId)]);
};

// React Query hooks for accounts

// Get a single account by ID
export const useAccount = (id: string) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => fetchAccount(id),
    enabled: !!id,
  });
};

// Get a single account by ID (suspense version)
export const useSuspenseAccount = (id: string) => {
  return useSuspenseQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => fetchAccount(id),
  });
};

// Get accounts by customer ID
export const useAccountsByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: [...accountKeys.list(`customer-${customerId}`), customerId],
    queryFn: () => fetchAccountsByCustomer(customerId),
    enabled: !!customerId,
  });
};

// Get accounts by customer ID (suspense version)
export const useSuspenseAccountsByCustomer = (customerId: string) => {
  return useSuspenseQuery({
    queryKey: [...accountKeys.list(`customer-${customerId}`), customerId],
    queryFn: () => fetchAccountsByCustomer(customerId),
  });
};

// Prefetch account data
export const usePrefetchAccount = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: accountKeys.detail(id),
      queryFn: () => fetchAccount(id),
    });
  };
};