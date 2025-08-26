import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Assignment } from '../shared/contracts/assignment';

// Query keys for assignment-related queries
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters: string) => [...assignmentKeys.lists(), { filters }] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  byUser: (userId: string) => [...assignmentKeys.lists(), 'user', userId] as const,
  byStall: (stallId: string) => [...assignmentKeys.lists(), 'stall', stallId] as const,
};

// Fetch a single assignment by ID
export const fetchAssignment = async (id: string): Promise<Assignment | null> => {
  return fetchDocument<Assignment>('assignments', id);
};

// Fetch assignments by user ID with pagination
export const fetchAssignmentsByUser = async (userId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Assignment[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Assignment>('assignments', pageSize, lastDocument, [where('id', '==', userId)]);
};

// Fetch assignments by stall ID with pagination
export const fetchAssignmentsByStall = async (stallId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Assignment[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Assignment>('assignments', pageSize, lastDocument, [where('stallId', '==', stallId)]);
};

// Fetch all assignments with pagination
export const fetchAssignments = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<Assignment>('assignments', pageSize, lastDocument);
};

// React Query hooks for assignments

// Get a single assignment by ID
export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => fetchAssignment(id),
    enabled: !!id,
  });
};

// Get a single assignment by ID (suspense version)
export const useSuspenseAssignment = (id: string) => {
  return useSuspenseQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => fetchAssignment(id),
  });
};

// Get assignments by user ID with pagination
export const useAssignmentsByUser = (userId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: assignmentKeys.byUser(userId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchAssignmentsByUser(userId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!userId,
  });
};

// Get assignments by user ID (suspense version) with pagination
export const useSuspenseAssignmentsByUser = (userId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: assignmentKeys.byUser(userId),
    queryFn: async () => {
      const result = await fetchAssignmentsByUser(userId, pageSize);
      return result.data;
    },
  });
};

// Get assignments by stall ID with pagination
export const useAssignmentsByStall = (stallId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: assignmentKeys.byStall(stallId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchAssignmentsByStall(stallId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!stallId,
  });
};

// Get assignments by stall ID (suspense version) with pagination
export const useSuspenseAssignmentsByStall = (stallId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: assignmentKeys.byStall(stallId),
    queryFn: async () => {
      const result = await fetchAssignmentsByStall(stallId, pageSize);
      return result.data;
    },
  });
};

// Get all assignments with infinite scrolling
export const useAssignments = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: assignmentKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchAssignments(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Prefetch assignment data
export const usePrefetchAssignment = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: assignmentKeys.detail(id),
      queryFn: () => fetchAssignment(id),
    });
  };
};