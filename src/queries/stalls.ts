import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Stall } from '../shared/contracts/stall';

// Query keys for stall-related queries
export const stallKeys = {
  all: ['stalls'] as const,
  lists: () => [...stallKeys.all, 'list'] as const,
  list: (filters: string) => [...stallKeys.lists(), { filters }] as const,
  details: () => [...stallKeys.all, 'detail'] as const,
  detail: (id: string) => [...stallKeys.details(), id] as const,
};

// Fetch a single stall by ID
export const fetchStall = async (id: string): Promise<Stall | null> => {
  return fetchDocument<Stall>('stalls', id);
};

// Fetch all stalls without pagination
export const fetchStalls = async (searchTerm?: string) => {
  // Add search filter if searchTerm is provided
  const constraints = searchTerm
    ? [where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff')]
    : [];
    
  // Fetch all stalls without pagination
  const result = await fetchDocuments<Stall>('stalls', constraints);
  return { data: result, lastDoc: null };
};

// React Query hooks for stalls

// Get a single stall by ID
export const useStall = (id: string) => {
  return useQuery({
    queryKey: stallKeys.detail(id),
    queryFn: () => fetchStall(id),
    enabled: !!id,
  });
};

// Get a single stall by ID (suspense version)
export const useSuspenseStall = (id: string) => {
  return useSuspenseQuery({
    queryKey: stallKeys.detail(id),
    queryFn: () => fetchStall(id),
  });
};

// Get all stalls without pagination
export const useStalls = (searchTerm?: string) => {
  return useQuery({
    queryKey: stallKeys.list(searchTerm || 'all'),
    queryFn: async () => {
      const result = await fetchStalls(searchTerm);
      return result;
    },
  });
};

// Prefetch stall data
export const usePrefetchStall = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: stallKeys.detail(id),
      queryFn: () => fetchStall(id),
    });
  };
};