import { useQuery, useSuspenseQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchDocument, fetchDocuments, fetchDocumentsPaginated, fetchDocumentByField } from '../services/queryService';
import { where } from 'firebase/firestore';
import { QRCode, QRBatch } from '../shared/contracts/qrCode';
import { Customer } from '../shared/contracts/customer';

// Query keys for QR code-related queries
export const qrCodeKeys = {
  all: ['qrCodes'] as const,
  lists: () => [...qrCodeKeys.all, 'list'] as const,
  list: (filters: string) => [...qrCodeKeys.lists(), { filters }] as const,
  details: () => [...qrCodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...qrCodeKeys.details(), id] as const,
  batches: () => [...qrCodeKeys.all, 'batches'] as const,
  batch: (id: string) => [...qrCodeKeys.batches(), id] as const,
  validation: () => [...qrCodeKeys.all, 'validation'] as const,
  validateRegistration: (id: string) => [...qrCodeKeys.validation(), 'registration', id] as const,
  validateRegistrationByLabel: (label: string) => [...qrCodeKeys.validation(), 'registration', 'label', label] as const,
  validateSales: (id: string) => [...qrCodeKeys.validation(), 'sales', id] as const,
  validateSalesByLabel: (label: string) => [...qrCodeKeys.validation(), 'sales', 'label', label] as const,
  validateCheckout: (id: string) => [...qrCodeKeys.validation(), 'checkout', id] as const,
  validateCheckoutByLabel: (label: string) => [...qrCodeKeys.validation(), 'checkout', 'label', label] as const,
};

// Fetch a single QR code by ID
export const fetchQRCode = async (id: string): Promise<QRCode | null> => {
  return fetchDocument<QRCode>('qrCodes', id);
};

// Fetch a single QR code by label
export const fetchQRCodeByLabel = async (label: string): Promise<QRCode | null> => {
  return fetchDocumentByField<QRCode>('qrCodes', 'label', label);
};

// Verify QR code is assigned and return customer details
export const fetchQRCodeCustomer = async (id: string): Promise<{ qrCode: QRCode; customer: Customer } | null> => {
  const qrCode = await fetchQRCode(id);
  
  if (!qrCode || !qrCode.assignedCustomerId) {
    return null;
  }
  
  const customer = await fetchDocument<Customer>('customers', qrCode.assignedCustomerId);
  
  if (!customer) {
    return null;
  }
  
  return { qrCode, customer };
};

// Fetch QR codes by assigned customer ID with pagination
export const fetchQRCodesByCustomer = async (customerId: string | null, pageSize: number = 20, lastDocument?: any): Promise<{ data: QRCode[]; lastDoc: any }> => {
  if (customerId) {
    return fetchDocumentsPaginated<QRCode>('qrCodes', pageSize, lastDocument, [where('assignedCustomerId', '==', customerId)]);
  }
  return fetchDocumentsPaginated<QRCode>('qrCodes', pageSize, lastDocument, [where('assignedCustomerId', '==', null)]);
};

// Fetch QR codes by batch ID with pagination
export const fetchQRCodesByBatch = async (batchId: string | null, pageSize: number = 20, lastDocument?: any): Promise<{ data: QRCode[]; lastDoc: any }> => {
  if (batchId) {
    return fetchDocumentsPaginated<QRCode>('qrCodes', pageSize, lastDocument, [where('batchId', '==', batchId)]);
  }
  return fetchDocumentsPaginated<QRCode>('qrCodes', pageSize, lastDocument, [where('batchId', '==', null)]);
};

// Fetch all QR codes with pagination
export const fetchQRCodes = async (pageSize: number = 20, lastDocument?: any) => {
  return fetchDocumentsPaginated<QRCode>('qrCodes', pageSize, lastDocument);
};

// Fetch a single QR batch by ID
export const fetchQRBatch = async (id: string): Promise<QRBatch | null> => {
  return fetchDocument<QRBatch>('qrBatches', id);
};

// Validate QR code for registration (exists and not assigned to another customer)
export const validateQRCodeForRegistration = async (id: string): Promise<QRCode | null> => {
  const qrCode = await fetchQRCode(id);
  
  // QR code is valid for registration if it exists and is not assigned to another customer
  if (qrCode && !qrCode.assignedCustomerId && qrCode.status === 'unassigned') {
    return qrCode;
  }
  
  return null;
};

// Validate QR code for registration by label (exists and not assigned to another customer)
export const validateQRCodeForRegistrationByLabel = async (label: string): Promise<QRCode | null> => {
  const qrCode = await fetchQRCodeByLabel(label);
  
  // QR code is valid for registration if it exists and is not assigned to another customer
  if (qrCode && !qrCode.assignedCustomerId && qrCode.status === 'unassigned') {
    return qrCode;
  }
  
  return null;
};

// Validate QR code for sales (exists and assigned to a customer)
export const validateQRCodeForSales = async (id: string): Promise<QRCode | null> => {
  const qrCode = await fetchQRCode(id);
  
  // QR code is valid for sales if it exists and is assigned to a customer
  if (qrCode && qrCode.assignedCustomerId && qrCode.status === 'assigned') {
    return qrCode;
  }
  
  return null;
};

// Validate QR code for sales by label (exists and assigned to a customer)
export const validateQRCodeForSalesByLabel = async (label: string): Promise<QRCode | null> => {
  const qrCode = await fetchQRCodeByLabel(label);
  
  // QR code is valid for sales if it exists and is assigned to a customer
  if (qrCode && qrCode.assignedCustomerId && qrCode.status === 'assigned') {
    return qrCode;
  }
  
  return null;
};

// Validate QR code for checkouts (exists and assigned to a customer)
export const validateQRCodeForCheckout = async (id: string): Promise<QRCode | null> => {
  const qrCode = await fetchQRCode(id);
  
  // QR code is valid for checkouts if it exists and is assigned to a customer
  if (qrCode && qrCode.assignedCustomerId && qrCode.status === 'assigned') {
    return qrCode;
  }
  
  return null;
};

// Validate QR code for checkouts by label (exists and assigned to a customer)
export const validateQRCodeForCheckoutByLabel = async (label: string): Promise<QRCode | null> => {
  const qrCode = await fetchQRCodeByLabel(label);
  
  // QR code is valid for checkouts if it exists and is assigned to a customer
  if (qrCode && qrCode.assignedCustomerId && qrCode.status === 'assigned') {
    return qrCode;
  }
  
  return null;
};

// Fetch all QR batches
export const fetchQRBatches = async (): Promise<QRBatch[]> => {
  return fetchDocuments<QRBatch>('qrBatches');
};

// React Query hooks for QR codes

// Verify QR code is assigned and return customer details
export const useQRCodeCustomer = (id: string) => {
  return useQuery({
    queryKey: [...qrCodeKeys.detail(id), 'customer'],
    queryFn: () => fetchQRCodeCustomer(id),
    enabled: !!id,
  });
};

// Verify QR code is assigned and return customer details (suspense version)
export const useSuspenseQRCodeCustomer = (id: string) => {
  return useSuspenseQuery({
    queryKey: [...qrCodeKeys.detail(id), 'customer'],
    queryFn: () => fetchQRCodeCustomer(id),
  });
};

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

// Get QR codes by assigned customer ID with pagination
export const useQRCodesByCustomer = (customerId: string | null, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: [...qrCodeKeys.list(`customer-${customerId}`), customerId],
    queryFn: async ({ pageParam }) => {
      const result = await fetchQRCodesByCustomer(customerId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: customerId !== undefined,
  });
};

// Get QR codes by assigned customer ID (suspense version) with pagination
export const useSuspenseQRCodesByCustomer = (customerId: string | null, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: [...qrCodeKeys.list(`customer-${customerId}`), customerId],
    queryFn: async () => {
      const result = await fetchQRCodesByCustomer(customerId, pageSize);
      return result.data;
    },
  });
};

// Get QR codes by batch ID with pagination
export const useQRCodesByBatch = (batchId: string | null, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: [...qrCodeKeys.list(`batch-${batchId}`), batchId],
    queryFn: async ({ pageParam }) => {
      const result = await fetchQRCodesByBatch(batchId, pageSize, pageParam);
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    initialPageParam: undefined,
    enabled: batchId !== undefined,
  });
};

// Get QR codes by batch ID (suspense version) with pagination
export const useSuspenseQRCodesByBatch = (batchId: string | null, pageSize: number = 20) => {
  return useSuspenseQuery({
    queryKey: [...qrCodeKeys.list(`batch-${batchId}`), batchId],
    queryFn: async () => {
      const result = await fetchQRCodesByBatch(batchId, pageSize);
      return result.data;
    },
  });
};

// Validate QR code for registration by label
export const useQRCodeValidationForRegistrationByLabel = (label: string) => {
  return useQuery({
    queryKey: qrCodeKeys.validateRegistrationByLabel(label),
    queryFn: () => validateQRCodeForRegistrationByLabel(label),
    enabled: !!label,
  });
};

// Validate QR code for registration by label (suspense version)
export const useSuspenseQRCodeValidationForRegistrationByLabel = (label: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.validateRegistrationByLabel(label),
    queryFn: () => validateQRCodeForRegistrationByLabel(label),
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

// React Query hooks for QR code validation

// Validate QR code for registration
export const useQRCodeValidationForRegistration = (id: string) => {
  return useQuery({
    queryKey: qrCodeKeys.validateRegistration(id),
    queryFn: () => validateQRCodeForRegistration(id),
    enabled: !!id,
  });
};

// Validate QR code for registration (suspense version)
export const useSuspenseQRCodeValidationForRegistration = (id: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.validateRegistration(id),
    queryFn: () => validateQRCodeForRegistration(id),
  });
};

// Validate QR code for sales
export const useQRCodeValidationForSales = (id: string) => {
  return useQuery({
    queryKey: qrCodeKeys.validateSales(id),
    queryFn: () => validateQRCodeForSales(id),
    enabled: !!id,
  });
};

// Validate QR code for sales (suspense version)
export const useSuspenseQRCodeValidationForSales = (id: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.validateSales(id),
    queryFn: () => validateQRCodeForSales(id),
  });
};

// Validate QR code for sales by label
export const useQRCodeValidationForSalesByLabel = (label: string) => {
  return useQuery({
    queryKey: qrCodeKeys.validateSalesByLabel(label),
    queryFn: () => validateQRCodeForSalesByLabel(label),
    enabled: !!label,
  });
};

// Validate QR code for sales by label (suspense version)
export const useSuspenseQRCodeValidationForSalesByLabel = (label: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.validateSalesByLabel(label),
    queryFn: () => validateQRCodeForSalesByLabel(label),
  });
};

// Validate QR code for checkouts
export const useQRCodeValidationForCheckout = (id: string) => {
  return useQuery({
    queryKey: qrCodeKeys.validateCheckout(id),
    queryFn: () => validateQRCodeForCheckout(id),
    enabled: !!id,
  });
};

// Validate QR code for checkouts (suspense version)
export const useSuspenseQRCodeValidationForCheckout = (id: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.validateCheckout(id),
    queryFn: () => validateQRCodeForCheckout(id),
  });
};

// Validate QR code for checkouts by label
export const useQRCodeValidationForCheckoutByLabel = (label: string) => {
  return useQuery({
    queryKey: qrCodeKeys.validateCheckoutByLabel(label),
    queryFn: () => validateQRCodeForCheckoutByLabel(label),
    enabled: !!label,
  });
};

// Validate QR code for checkouts by label (suspense version)
export const useSuspenseQRCodeValidationForCheckoutByLabel = (label: string) => {
  return useSuspenseQuery({
    queryKey: qrCodeKeys.validateCheckoutByLabel(label),
    queryFn: () => validateQRCodeForCheckoutByLabel(label),
  });
};