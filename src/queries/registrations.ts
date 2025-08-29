import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentsPaginated } from '../services/queryService';
import { where, orderBy } from 'firebase/firestore';
import { Registration } from '../shared/contracts/registration';

// Query keys for registration-related queries
export const registrationKeys = {
  all: ['registrations'] as const,
  lists: () => [...registrationKeys.all, 'list'] as const,
  list: (filters: string) => [...registrationKeys.lists(), { filters }] as const,
  details: () => [...registrationKeys.all, 'detail'] as const,
  detail: (id: string) => [...registrationKeys.details(), id] as const,
  byOperator: (operatorName: string) => [...registrationKeys.lists(), 'operator', operatorName] as const,
  byCustomer: (customerId: string) => [...registrationKeys.lists(), 'customer', customerId] as const,
  byQRCode: (qrCodeId: string) => [...registrationKeys.lists(), 'qrCode', qrCodeId] as const,
  byStall: (stallId: string) => [...registrationKeys.lists(), 'stall', stallId] as const,
};

// Fetch a single registration by ID
export const fetchRegistration = async (id: string): Promise<Registration | null> => {
  return fetchDocument<Registration>('registrations', id);
};

// Fetch registrations by operator name with pagination
export const fetchRegistrationsByOperator = async (operatorName: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Registration[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Registration>('registrations', pageSize, lastDocument, [where('operatorName', '==', operatorName)], 'createdAt');
};

// Fetch registrations by customer ID with pagination
export const fetchRegistrationsByCustomer = async (customerId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Registration[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Registration>('registrations', pageSize, lastDocument, [where('customerId', '==', customerId)], 'createdAt');
};

// Fetch registrations by QR code ID with pagination
export const fetchRegistrationsByQRCode = async (qrCodeId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Registration[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Registration>('registrations', pageSize, lastDocument, [where('qrCodeId', '==', qrCodeId)], 'createdAt');
};

// Fetch registrations by stall ID with pagination
export const fetchRegistrationsByStall = async (stallId: string, pageSize: number = 20, lastDocument?: any): Promise<{ data: Registration[]; lastDoc: any }> => {
  return fetchDocumentsPaginated<Registration>('registrations', pageSize, lastDocument, [where('stallId', '==', stallId)], 'createdAt');
};

// Fetch all registrations with pagination
export const fetchRegistrations = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<Registration>('registrations', pageSize, lastDocument, [], 'createdAt');
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

// Get registrations by operator name with pagination
export const useRegistrationsByOperator = (operatorName: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: registrationKeys.byOperator(operatorName),
    queryFn: async ({ pageParam }) => {
      const result = await fetchRegistrationsByOperator(operatorName, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!operatorName,
  });
};

// Get registrations by operator name (suspense version) with pagination
export const useSuspenseRegistrationsByOperator = (operatorName: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: registrationKeys.byOperator(operatorName),
    queryFn: async () => {
      const result = await fetchRegistrationsByOperator(operatorName, pageSize);
      return result.data;
    },
  });
};

// Get registrations by customer ID with pagination
export const useRegistrationsByCustomer = (customerId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: registrationKeys.byCustomer(customerId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchRegistrationsByCustomer(customerId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!customerId,
  });
};

// Get registrations by customer ID (suspense version) with pagination
export const useSuspenseRegistrationsByCustomer = (customerId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: registrationKeys.byCustomer(customerId),
    queryFn: async () => {
      const result = await fetchRegistrationsByCustomer(customerId, pageSize);
      return result.data;
    },
  });
};

// Get registrations by QR code ID with pagination
export const useRegistrationsByQRCode = (qrCodeId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: registrationKeys.byQRCode(qrCodeId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchRegistrationsByQRCode(qrCodeId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!qrCodeId,
  });
};

// Get registrations by stall ID with pagination
export const useRegistrationsByStall = (stallId: string, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: registrationKeys.byStall(stallId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchRegistrationsByStall(stallId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: !!stallId,
  });
};

// Get registrations by QR code ID (suspense version) with pagination
export const useSuspenseRegistrationsByQRCode = (qrCodeId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: registrationKeys.byQRCode(qrCodeId),
    queryFn: async () => {
      const result = await fetchRegistrationsByQRCode(qrCodeId, pageSize);
      return result.data;
    },
  });
};

// Get registrations by stall ID (suspense version) with pagination
export const useSuspenseRegistrationsByStall = (stallId: string, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: registrationKeys.byStall(stallId),
    queryFn: async () => {
      const result = await fetchRegistrationsByStall(stallId, pageSize);
      return result.data;
    },
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