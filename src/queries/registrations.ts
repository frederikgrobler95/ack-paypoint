import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Registration } from '../shared/contracts/registration';

// Query keys for registration-related queries
export const registrationKeys = {
  all: ['registrations'] as const,
  lists: () => [...registrationKeys.all, 'list'] as const,
  list: (filters: string) => [...registrationKeys.lists(), { filters }] as const,
  details: () => [...registrationKeys.all, 'detail'] as const,
  detail: (id: string) => [...registrationKeys.details(), id] as const,
};

// Fetch a single registration by ID
export const fetchRegistration = async (id: string): Promise<Registration | null> => {
  return fetchDocument<Registration>('registrations', id);
};

// Fetch registrations by customer ID
export const fetchRegistrationsByCustomer = async (customerId: string): Promise<Registration[]> => {
  return fetchDocuments<Registration>('registrations', [where('customerId', '==', customerId)]);
};

// Fetch registrations by QR code ID
export const fetchRegistrationsByQrCode = async (qrCodeId: string): Promise<Registration[]> => {
  return fetchDocuments<Registration>('registrations', [where('qrCodeId', '==', qrCodeId)]);
};

// Fetch all registrations with pagination
export const fetchRegistrations = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<Registration>('registrations', pageSize, lastDocument);
};

// React Query hooks for registrations

// Get a single registration by ID
export const useRegistration = (id: string) => {
  return useQuery({
    queryKey: registrationKeys.detail(id),
    queryFn: () => fetchRegistration(id),
    enabled: !!id,
  });
};

// Get a single registration by ID (suspense version)
export const useSuspenseRegistration = (id: string) => {
  return useSuspenseQuery({
    queryKey: registrationKeys.detail(id),
    queryFn: () => fetchRegistration(id),
  });
};

// Get registrations by customer ID
export const useRegistrationsByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: [...registrationKeys.list(`customer-${customerId}`), customerId],
    queryFn: () => fetchRegistrationsByCustomer(customerId),
    enabled: !!customerId,
  });
};

// Get registrations by customer ID (suspense version)
export const useSuspenseRegistrationsByCustomer = (customerId: string) => {
  return useSuspenseQuery({
    queryKey: [...registrationKeys.list(`customer-${customerId}`), customerId],
    queryFn: () => fetchRegistrationsByCustomer(customerId),
  });
};

// Get registrations by QR code ID
export const useRegistrationsByQrCode = (qrCodeId: string) => {
  return useQuery({
    queryKey: [...registrationKeys.list(`qrCode-${qrCodeId}`), qrCodeId],
    queryFn: () => fetchRegistrationsByQrCode(qrCodeId),
    enabled: !!qrCodeId,
  });
};

// Get registrations by QR code ID (suspense version)
export const useSuspenseRegistrationsByQrCode = (qrCodeId: string) => {
  return useSuspenseQuery({
    queryKey: [...registrationKeys.list(`qrCode-${qrCodeId}`), qrCodeId],
    queryFn: () => fetchRegistrationsByQrCode(qrCodeId),
  });
};

// Get all registrations with infinite scrolling
export const useRegistrations = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: registrationKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchRegistrations(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Prefetch registration data
export const usePrefetchRegistration = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: registrationKeys.detail(id),
      queryFn: () => fetchRegistration(id),
    });
  };
};