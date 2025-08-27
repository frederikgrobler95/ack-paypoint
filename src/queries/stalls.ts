import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentsPaginated } from '../services/queryService';
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

// Fetch all stalls with pagination
export const fetchStalls = async (pageSize: number = 20, lastDocument?: any) => {
  // Use fetchDocumentsPaginated without orderBy since Stall doesn't have createdAt field
  return fetchDocumentsPaginated<Stall>('stalls', pageSize, lastDocument, [], undefined);
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

// Get all stalls with infinite scrolling
export const useStalls = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: stallKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchStalls(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
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