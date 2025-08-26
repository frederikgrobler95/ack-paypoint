import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentsPaginated } from '../services/queryService';
import { User } from '../shared/contracts/user';

// Query keys for user-related queries
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch a single user by ID
export const fetchUser = async (id: string): Promise<User | null> => {
  return fetchDocument<User>('users', id);
};

// Fetch all users with pagination
export const fetchUsers = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<User>('users', pageSize, lastDocument);
};

// React Query hooks for users

// Get a single user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

// Get a single user by ID (suspense version)
export const useSuspenseUser = (id: string) => {
  return useSuspenseQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });
};

// Get all users with infinite scrolling
export const useUsers = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: userKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchUsers(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Prefetch user data
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => fetchUser(id),
    });
  };
};