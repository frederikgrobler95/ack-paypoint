import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated } from '../services/queryService';
import { where } from 'firebase/firestore';
import { QRCode, QRBatch } from '../shared/contracts/qrCode';

// Query keys for QR code-related queries
export const qrCodeKeys = {
  all: ['qrCodes'] as const,
  lists: () => [...qrCodeKeys.all, 'list'] as const,
  list: (filters: string) => [...qrCodeKeys.lists(), { filters }] as const,
  details: () => [...qrCodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...qrCodeKeys.details(), id] as const,
  batches: () => [...qrCodeKeys.all, 'batches'] as const,
  batch: (id: string) => [...qrCodeKeys.batches(), id] as const,
};

// Fetch a single QR code by ID
export const fetchQRCode = async (id: string): Promise<QRCode | null> => {
  return fetchDocument<QRCode>('qrCodes', id);
};

// Fetch QR codes by assigned customer ID
export const fetchQRCodesByCustomer = async (customerId: string | null): Promise<QRCode[]> => {
  if (customerId) {
    return fetchDocuments<QRCode>('qrCodes', [where('assignedCustomerId', '==', customerId)]);
  }
  return fetchDocuments<QRCode>('qrCodes', [where('assignedCustomerId', '==', null)]);
};

// Fetch QR codes by batch ID
export const fetchQRCodesByBatch = async (batchId: string | null): Promise<QRCode[]> => {
  if (batchId) {
    return fetchDocuments<QRCode>('qrCodes', [where('batchId', '==', batchId)]);
  }
  return fetchDocuments<QRCode>('qrCodes', [where('batchId', '==', null)]);
};

// Fetch all QR codes with pagination
export const fetchQRCodes = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<QRCode>('qrCodes', pageSize, lastDocument);
};

// Fetch a single QR batch by ID
export const fetchQRBatch = async (id: string): Promise<QRBatch | null> => {
  return fetchDocument<QRBatch>('qrBatches', id);
};

// Fetch all QR batches
export const fetchQRBatches = async (): Promise<QRBatch[]> => {
  return fetchDocuments<QRBatch>('qrBatches');
};

// React Query hooks for QR codes

// Get a single QR code by ID
export const useQRCode = (id: string) => {
  return useQuery({
    queryKey: qrCodeKeys.detail(id),
    queryFn: () => fetchQRCode(id),
    enabled: !!id,
  });
};

// Get a single QR code by ID (suspense version)
export const useSuspenseQRCode = (id: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.detail(id),
    queryFn: () => fetchQRCode(id),
  });
};

// Get QR codes by assigned customer ID
export const useQRCodesByCustomer = (customerId: string | null) => {
  return useQuery({
    queryKey: [...qrCodeKeys.list(`customer-${customerId}`), customerId],
    queryFn: () => fetchQRCodesByCustomer(customerId),
    enabled: customerId !== undefined,
  });
};

// Get QR codes by assigned customer ID (suspense version)
export const useSuspenseQRCodesByCustomer = (customerId: string | null) => {
  return useSuspenseQuery({
    queryKey: [...qrCodeKeys.list(`customer-${customerId}`), customerId],
    queryFn: () => fetchQRCodesByCustomer(customerId),
  });
};

// Get QR codes by batch ID
export const useQRCodesByBatch = (batchId: string | null) => {
  return useQuery({
    queryKey: [...qrCodeKeys.list(`batch-${batchId}`), batchId],
    queryFn: () => fetchQRCodesByBatch(batchId),
    enabled: batchId !== undefined,
  });
};

// Get QR codes by batch ID (suspense version)
export const useSuspenseQRCodesByBatch = (batchId: string | null) => {
  return useSuspenseQuery({
    queryKey: [...qrCodeKeys.list(`batch-${batchId}`), batchId],
    queryFn: () => fetchQRCodesByBatch(batchId),
  });
};

// Get all QR codes with infinite scrolling
export const useQRCodes = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: qrCodeKeys.list('all'),
    queryFn: async ({ pageParam }) => {
      const result = await fetchQRCodes(pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
  });
};

// Get a single QR batch by ID
export const useQRBatch = (id: string) => {
  return useQuery({
    queryKey: qrCodeKeys.batch(id),
    queryFn: () => fetchQRBatch(id),
    enabled: !!id,
  });
};

// Get all QR batches
export const useQRBatches = () => {
  return useQuery({
    queryKey: qrCodeKeys.batches(),
    queryFn: fetchQRBatches,
  });
};

// Prefetch QR code data
export const usePrefetchQRCode = () => {
  const queryClient = useQueryClient();
  
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: qrCodeKeys.detail(id),
      queryFn: () => fetchQRCode(id),
    });
  };
};