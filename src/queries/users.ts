import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments } from '../services/queryService';
import { where } from 'firebase/firestore';
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

// Fetch all users without pagination
export const fetchUsers = async (searchTerm?: string) => {
  // If no search term, fetch all users
  if (!searchTerm) {
    const result = await fetchDocuments<User>('users');
    return { data: result, lastDoc: null };
  }
  
  // For search, fetch all users and filter client-side for case-insensitive matching
  // This approach allows searching across multiple fields (name, username, email)
  const allUsers = await fetchDocuments<User>('users');
  
  const term = searchTerm.toLowerCase();
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(term) ||
    user.username.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term)
  );
  
  return { data: filteredUsers, lastDoc: null };
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

// Get all users without pagination
export const useUsers = (searchTerm?: string) => {
  return useQuery({
    queryKey: userKeys.list(searchTerm || 'all'),
    queryFn: async () => {
      const result = await fetchUsers(searchTerm);
      return result;
    },
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