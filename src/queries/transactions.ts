import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Transaction } from '../shared/contracts/transaction';

// Query keys for transaction-related queries
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: string) => [...transactionKeys.lists(), { filters }] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// Fetch a single transaction by ID
export const fetchTransaction = async (id: string): Promise<Transaction | null> => {
  return fetchDocument<Transaction>('transactions', id);
};

// Fetch transactions by account ID
export const fetchTransactionsByAccount = async (accountId: string): Promise<Transaction[]> => {
  return fetchDocuments<Transaction>('transactions', [where('accountId', '==', accountId)]);
};

// Fetch transactions by stall ID
export const fetchTransactionsByStall = async (stallId: string): Promise<Transaction[]> => {
  return fetchDocuments<Transaction>('transactions', [where('stallId', '==', stallId)]);
};

// Fetch transactions by operator ID
export const fetchTransactionsByOperator = async (operatorId: string): Promise<Transaction[]> => {
  return fetchDocuments<Transaction>('transactions', [where('operatorId', '==', operatorId)]);
};

// Fetch all transactions with pagination
export const fetchTransactions = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<Transaction>('transactions', pageSize, lastDocument);
};

// React Query hooks for transactions

// Get a single transaction by ID
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => fetchTransaction(id),
    enabled: !!id,
  });
};

// Get a single transaction by ID (suspense version)
export const useSuspenseTransaction = (id: string) => {
  return useSuspenseQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => fetchTransaction(id),
  });
};

// Get transactions by account ID
export const useTransactionsByAccount = (accountId: string) => {
  return useQuery({
    queryKey: [...transactionKeys.list(`account-${accountId}`), accountId],
    queryFn: () => fetchTransactionsByAccount(accountId),
    enabled: !!accountId,
  });
};

// Get transactions by account ID (suspense version)
export const useSuspenseTransactionsByAccount = (accountId: string) => {
  return useSuspenseQuery({
    queryKey: [...transactionKeys.list(`account-${accountId}`), accountId],
    queryFn: () => fetchTransactionsByAccount(accountId),
  });
};

// Get transactions by stall ID
export const useTransactionsByStall = (stallId: string) => {
  return useQuery({
    queryKey: [...transactionKeys.list(`stall-${stallId}`), stallId],
    queryFn: () => fetchTransactionsByStall(stallId),
    enabled: !!stallId,
  });
};

// Get transactions by stall ID (suspense version)
export const useSuspenseTransactionsByStall = (stallId: string) => {
  return useSuspenseQuery({
    queryKey: [...transactionKeys.list(`stall-${stallId}`), stallId],
    queryFn: () => fetchTransactionsByStall(stallId),
  });
};

// Get transactions by operator ID
export const useTransactionsByOperator = (operatorId: string) => {
  return useQuery({
    queryKey: [...transactionKeys.list(`operator-${operatorId}`), operatorId],
    queryFn: () => fetchTransactionsByOperator(operatorId),
    enabled: !!operatorId,
  });
};

// Get transactions by operator ID (suspense version)
export const useSuspenseTransactionsByOperator = (operatorId: string) => {
  return useSuspenseQuery({
    queryKey: [...transactionKeys.list(`operator-${operatorId}`), operatorId],
    queryFn: () => fetchTransactionsByOperator(operatorId),
  });
};

// Get all transactions with infinite scrolling
export const useTransactions = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: transactionKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchTransactions(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Prefetch transaction data
export const usePrefetchTransaction = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: transactionKeys.detail(id),
      queryFn: () => fetchTransaction(id),
    });
  };
};