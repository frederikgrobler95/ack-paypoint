import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { downloadBlob } from './downloadService';

// Function to generate QR codes PDF using Firebase Cloud Functions
export const generateQrCodesPdf = async (qrCodeIds: string[], batchId?: string): Promise<Blob | null> => {
  console.log('generateQrCodesPdf called with IDs:', qrCodeIds);
  
  // Validate input
  if (!qrCodeIds || !Array.isArray(qrCodeIds) || qrCodeIds.length === 0) {
    throw new Error('Invalid request: qrCodeIds array is required and cannot be empty');
  }
  
  // Limit the number of QR codes that can be generated at once
  if (qrCodeIds.length > 500) {
    throw new Error('Too many QR codes requested. Maximum is 500.');
  }
  
  try {
    // Convert the function to a callable function
    // This will automatically use the emulator when connected
    const generateQrCodesPdfCallable = httpsCallable(functions, 'generateQrCodesPdf');
    
    // Call the function with the data
    const result = await generateQrCodesPdfCallable({ qrCodeIds, batchId });
    console.log('PDF generation successful', result);
    
    // The result contains the PDF as a base64 string
    const resultData = result.data as { data: string; success: boolean; message: string };
    const base64Data = resultData.data;
    
    // For React Native, we'll return the base64 data directly
    // and handle the conversion in the shareBlob function
    // Create a blob-like object with the base64 data
    const blob = {
      size: base64Data.length,
      type: 'application/pdf',
      base64Data: base64Data,
      arrayBuffer: async () => {
        // Convert base64 to array buffer
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      },
      text: async () => base64Data,
    };
    
    console.log('Blob-like object created, size:', blob.size);
    return blob as unknown as Blob;
  } catch (error: any) {
    console.error('Error generating QR codes PDF:', error);
    
    // Log error to console instead of showing toast
    const userMessage = error.message || 'Failed to generate QR codes PDF';
    throw new Error(userMessage);
  }
};

// Function to generate QR codes PDF for an entire batch using Firebase Cloud Functions
export const generateBatchQrCodesPdf = async (batchId: string): Promise<Blob | null> => {
  console.log('generateBatchQrCodesPdf called with batchId:', batchId);
  
  // Validate input
  if (!batchId || typeof batchId !== 'string') {
    throw new Error('Invalid request: batchId is required and must be a string');
  }
  
  try {
    // Convert the function to a callable function
    // This will automatically use the emulator when connected
    const generateBatchQrCodesPdfCallable = httpsCallable(functions, 'generateBatchQrCodesPdf');
    
    // Call the function with the data
    const result = await generateBatchQrCodesPdfCallable({ batchId });
    console.log('Batch PDF generation successful', result);
    
    // The result contains the PDF as a base64 string
    const resultData = result.data as { data: string; success: boolean; message: string };
    const base64Data = resultData.data;
    
    // For React Native, we'll return the base64 data directly
    // and handle the conversion in the shareBlob function
    // Create a blob-like object with the base64 data
    const blob = {
      size: base64Data.length,
      type: 'application/pdf',
      base64Data: base64Data,
      arrayBuffer: async () => {
        // Convert base64 to array buffer
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      },
      text: async () => base64Data,
    };
    
    console.log('Blob-like object created, size:', blob.size);
    return blob as unknown as Blob;
  } catch (error: any) {
    console.error('Error generating batch QR codes PDF:', error);
    
    // Log error to console instead of showing toast
    const userMessage = error.message || 'Failed to generate batch QR codes PDF';
    throw new Error(userMessage);
  }
};

// Function to download a blob as a file in web browsers
export const shareBlob = async (blob: Blob, filename: string) => {
  console.log('shareBlob called', { blobSize: blob.size, filename });
  
  // If it's our custom blob-like object, convert it to a real Blob
  if ((blob as any).base64Data) {
    const base64Data = (blob as any).base64Data;
    // Convert base64 to binary and create a real Blob
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    blob = new Blob([bytes], { type: 'application/pdf' });
  }
  
  // Use the existing download service
  downloadBlob(blob, filename);
  console.log('File downloaded successfully');
};