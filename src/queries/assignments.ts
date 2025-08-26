import { useQuery, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Assignment } from '../shared/contracts/assignment';

// Query keys for assignment-related queries
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters: string) => [...assignmentKeys.lists(), { filters }] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
};

// Fetch a single assignment by ID
export const fetchAssignment = async (id: string): Promise<Assignment | null> => {
  return fetchDocument<Assignment>('assignments', id);
};

// Fetch assignments by stall ID
export const fetchAssignmentsByStall = async (stallId: string): Promise<Assignment[]> => {
  return fetchDocuments<Assignment>('assignments', [where('stallId', '==', stallId)]);
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

// Get assignments by stall ID
export const useAssignmentsByStall = (stallId: string) => {
  return useQuery({
    queryKey: [...assignmentKeys.list(`stall-${stallId}`), stallId],
    queryFn: () => fetchAssignmentsByStall(stallId),
    enabled: !!stallId,
  });
};

// Get assignments by stall ID (suspense version)
export const useSuspenseAssignmentsByStall = (stallId: string) => {
  return useSuspenseQuery({
    queryKey: [...assignmentKeys.list(`stall-${stallId}`), stallId],
    queryFn: () => fetchAssignmentsByStall(stallId),
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