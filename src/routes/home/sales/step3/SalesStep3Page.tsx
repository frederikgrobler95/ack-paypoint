import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQRCodeCustomer } from '../../../../queries/qrCodes';
import { useCreateSaleMutation } from '../../../../mutations/useCreateSaleMutation';
import { useToast } from '../../../../contexts/ToastContext';
import { PaymentMethod } from '../../../../shared/contracts/payment';
import { useMyAssignment } from '../../../../contexts/MyAssignmentContext';

function SalesStep3Page(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { data: assignment } = useMyAssignment();
  
  const qrCode = searchParams.get('code') || '';
  const amountCents = parseInt(searchParams.get('amount') || '0', 10);
  
  const { data: qrData, isLoading: isQrLoading, isError: isQrError, error: qrError } = useQRCodeCustomer(qrCode);
  const { mutate: createSale, isPending: isCreatingSale, isError: isSaleError, error: saleError } = useCreateSaleMutation();
  
  const handleConfirmTransaction = () => {
    if (!qrData || !assignment) return;
    
    const input = {
      amountCents,
      operatorId: assignment.operator.id,
      operatorName: assignment.operator.name,
      customerId: qrData.customer.id,
      customerName: qrData.customer.name,
      stallId: assignment.stall.id,
      stallName: assignment.stall.name,
      idempotencyKey: `${qrCode}-${Date.now()}`, // Unique key to prevent duplicate transactions
    };
    
    createSale(input, {
      onSuccess: () => {
        addToast('Transaction completed successfully', 'success');
        navigate('/');
      },
      onError: (error) => {
        addToast(`Error creating sale: ${error.message}`, 'error');
      }
    });
  };
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  // Loading state
  if (isQrLoading) {
    return (
      <>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales - Step 3</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">Loading customer details...</div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Error state for QR code
  if (isQrError) {
    return (
      <>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales - Step 3</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">Error loading customer details: {qrError?.message}</div>
              <button
                onClick={() => navigate('/home/sales/step1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Error state for sale creation
  if (isSaleError) {
    return (
      <>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales - Step 3</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">Error creating sale: {saleError?.message}</div>
              <button
                onClick={() => navigate('/home/sales/step1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // No data state
  if (!qrData) {
    return (
      <>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales - Step 3</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">Invalid QR code or customer not found</div>
              <button
                onClick={() => navigate('/home/sales/step1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales - Step 3</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Confirm Transaction</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{qrData.customer.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transaction Amount:</span>
              <span className="font-medium text-lg">R {formatAmount(amountCents)}</span>
            </div>
          </div>
          
          <button
            onClick={handleConfirmTransaction}
            disabled={isCreatingSale}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition duration-200 ${
              isCreatingSale 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCreatingSale ? 'Processing...' : 'Confirm Transaction'}
          </button>
          
          {isCreatingSale && (
            <div className="mt-4 text-center text-gray-600">
              Processing transaction, please wait...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SalesStep3Page;