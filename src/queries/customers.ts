import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { Customer } from '../shared/contracts/customer';
import { QRCode } from '../shared/contracts/qrCode';

// Query keys for customer-related queries
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: string) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  byQRCode: (qrCodeId: string | null) => [...customerKeys.lists(), 'qrCode', qrCodeId] as const,
};

// Fetch a single customer by ID
export const fetchCustomer = async (id: string): Promise<Customer | null> => {
  return fetchDocument<Customer>('customers', id);
};

// Fetch customers by QR code ID with pagination
export const fetchCustomersByQRCode = async (qrCodeId: string | null, pageSize: number = 20, lastDocument?: any): Promise<{ data: Customer[]; lastDoc: any }> => {
  if (qrCodeId) {
    return fetchDocumentsPaginated<Customer>('customers', pageSize, lastDocument, [where('qrCodeId', '==', qrCodeId)], 'createdAt');
  }
  return fetchDocumentsPaginated<Customer>('customers', pageSize, lastDocument, [where('qrCodeId', '==', null)], 'createdAt');
};

// Fetch all customers without pagination
export const fetchCustomers = async (searchTerm?: string) => {
  // If no search term, fetch all customers
  if (!searchTerm) {
    const result = await fetchDocuments<Customer>('customers');
    return { data: result, lastDoc: null };
  }
  
  // For search, fetch all customers and filter client-side for case-insensitive matching
  // This approach allows searching across multiple fields (name, phone, QR code ID, QR code label)
  const allCustomers = await fetchDocuments<Customer>('customers');
  
  // Fetch all QR codes to enable searching by label
  const allQrCodes = await fetchDocuments<QRCode>('qrCodes');
  const qrCodeMap = new Map<string, QRCode>();
  allQrCodes.forEach(qrCode => qrCodeMap.set(qrCode.id, qrCode));
  
  const term = searchTerm.toLowerCase();
  const filteredCustomers = allCustomers.filter(customer => {
    // Check name, phone, and QR code ID directly with null/undefined checks
    if (
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.phoneE164 && customer.phoneE164.toLowerCase().includes(term)) ||
      (customer.qrCodeId && customer.qrCodeId.toLowerCase().includes(term))
    ) {
      return true;
    }
    
    // Check QR code label if customer has a QR code
    if (customer.qrCodeId) {
      const qrCode = qrCodeMap.get(customer.qrCodeId);
      if (qrCode && qrCode.label && qrCode.label.toLowerCase().includes(term)) {
        return true;
      }
    }
    
    return false;
  });
  
  return { data: filteredCustomers, lastDoc: null };
};

// React Query hooks for customers

// Get a single customer by ID
export const useCustomer = (id: string, options?: any) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
    ...options,
  });
};

// Get a single customer by ID (suspense version)
export const useSuspenseCustomer = (id: string) => {
  return useSuspenseQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomer(id),
  });
};

// Get customers by QR code ID with pagination
export const useCustomersByQRCode = (qrCodeId: string | null, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: customerKeys.byQRCode(qrCodeId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchCustomersByQRCode(qrCodeId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: qrCodeId !== undefined,
  });
};

// Get customers by QR code ID (suspense version) with pagination
export const useSuspenseCustomersByQRCode = (qrCodeId: string | null, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: customerKeys.byQRCode(qrCodeId),
    queryFn: async () => {
      const result = await fetchCustomersByQRCode(qrCodeId, pageSize);
      return result.data;
    },
  });
};

// Get all customers without pagination
export const useCustomers = (searchTerm?: string) => {
  return useQuery({
    queryKey: customerKeys.list(searchTerm || 'all'),
    queryFn: async () => {
      const result = await fetchCustomers(searchTerm);
      return result;
    },
  });
};

// Prefetch customer data
export const usePrefetchCustomer = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: customerKeys.detail(id),
      queryFn: () => fetchCustomer(id),
    });
  };
};