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
  byStall: (stallId: string) => [...transactionKeys.lists(), 'stall', stallId] as const,
  byOperator: (operatorId: string) => [...transactionKeys.lists(), 'operator', operatorId] as const,
  byCustomer: (customerId: string) => [...transactionKeys.lists(), 'customer', customerId] as const,
  refunds: () => [...transactionKeys.all, 'refunds'] as const,
  sales: () => [...transactionKeys.all, 'sales'] as const,
};

// Fetch a single transaction by ID
export const fetchTransaction = async (id: string): Promise<Transaction | null> => {
  return fetchDocument<Transaction>('transactions', id);
};

// Fetch transactions by stall ID with pagination
export const fetchTransactionsByStall = async (stallId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Transaction[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Transaction>('transactions', pageSize, lastDocument, [where('stallId', '==', stallId)]);
};

// Fetch transactions by operator ID with pagination
export const fetchTransactionsByOperator = async (operatorId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Transaction[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Transaction>('transactions', pageSize, lastDocument, [where('operatorId', '==', operatorId)]);
};

// Fetch transactions by customer ID with pagination
export const fetchTransactionsByCustomer = async (customerId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Transaction[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Transaction>('transactions', pageSize, lastDocument, [where('customerId', '==', customerId)]);
};

// Fetch refund transactions
export const fetchRefundTransactions = async (): Promise<Transaction[]> => {
  return fetchDocuments<Transaction>('transactions', [where('type', '==', 'refund')]);
};

// Fetch sale transactions
export const fetchSaleTransactions = async (): Promise<Transaction[]> => {
  return fetchDocuments<Transaction>('transactions', [where('type', '==', 'sale')]);
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

// Get transactions by stall ID with pagination
export const useTransactionsByStall = (stallId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: transactionKeys.byStall(stallId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchTransactionsByStall(stallId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!stallId,
  });
};

// Get transactions by stall ID (suspense version) with pagination
export const useSuspenseTransactionsByStall = (stallId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: transactionKeys.byStall(stallId),
    queryFn: async () => {
      const result = await fetchTransactionsByStall(stallId, pageSize);
      return result.data;
    },
  });
};

// Get transactions by operator ID with pagination
export const useTransactionsByOperator = (operatorId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: transactionKeys.byOperator(operatorId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchTransactionsByOperator(operatorId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!operatorId,
  });
};

// Get transactions by operator ID (suspense version) with pagination
export const useSuspenseTransactionsByOperator = (operatorId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: transactionKeys.byOperator(operatorId),
    queryFn: async () => {
      const result = await fetchTransactionsByOperator(operatorId, pageSize);
      return result.data;
    },
  });
};

// Get transactions by customer ID with pagination
export const useTransactionsByCustomer = (customerId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: transactionKeys.byCustomer(customerId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchTransactionsByCustomer(customerId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!customerId,
  });
};

// Get transactions by customer ID (suspense version) with pagination
export const useSuspenseTransactionsByCustomer = (customerId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: transactionKeys.byCustomer(customerId),
    queryFn: async () => {
      const result = await fetchTransactionsByCustomer(customerId, pageSize);
      return result.data;
    },
  });
};

// Get refund transactions
export const useRefundTransactions = () => {
  return useQuery({
    queryKey: transactionKeys.refunds(),
    queryFn: fetchRefundTransactions,
  });
};

// Get refund transactions (suspense version)
export const useSuspenseRefundTransactions = () => {
  return useSuspenseQuery({
    queryKey: transactionKeys.refunds(),
    queryFn: fetchRefundTransactions,
  });
};

// Get sale transactions
export const useSaleTransactions = () => {
  return useQuery({
    queryKey: transactionKeys.sales(),
    queryFn: fetchSaleTransactions,
  });
};

// Get sale transactions (suspense version)
export const useSuspenseSaleTransactions = () => {
  return useSuspenseQuery({
    queryKey: transactionKeys.sales(),
    queryFn: fetchSaleTransactions,
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