import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQRCodeCustomer } from '../../../../../queries/qrCodes';
import { useTransaction } from '../../../../../queries/transactions';
import { useCreateTransactionMutation } from '@/mutations/useCreateTransactionMutation';
import { useMyAssignment } from '../../../../../contexts/MyAssignmentContext';
import { useToast } from '../../../../../contexts/ToastContext';
import { timestampToDate } from '@/shared/utils';

function RefundsStep4Page(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  // Get URL parameters
  const { qrCode, idempotencyKey, transactionId, amountCents: refundAmount } = location.state || {};
  
  // Get current operator information
  const { assignment } = useMyAssignment();
  const operatorId = assignment?.id || '';
  const operatorName = assignment?.userName || '';
  
  // Fetch customer details
  const { data: qrData, isLoading: isQrLoading, isError: isQrError } = useQRCodeCustomer(qrCode);
  
  // Fetch original transaction details
  const { data: transaction, isLoading: isTransactionLoading, isError: isTransactionError } = useTransaction(transactionId);
  
  // Refund mutation
  const { mutate: createRefund, isPending: isRefundPending } = useCreateTransactionMutation();
  
  // Format amount for display (in Rands)
  const formatAmount = (cents: number) => {
    const rands = cents / 100;
    return rands.toFixed(2);
  };
  
  // Handle confirm refund button click
  const handleConfirmRefund = () => {
    if (!qrData || !transaction || !operatorId) {
      showToast('Missing required information', 'error');
      return;
    }
    
    createRefund({
      amountCents: refundAmount,
      operatorId,
      operatorName,
      customerId: qrData.customer.id,
      customerName: qrData.customer.name,
      stallId: transaction.stallId,
      stallName: transaction.stallName,
      type: 'refund' as const,
      refundOfTxnId: transactionId,
      idempotencyKey,
    }, {
      onSuccess: () => {
        showToast('Refund processed successfully', 'success');
        // Navigate back to home page
        navigate('/');
      },
      onError: (error: any) => {
        console.error('Refund error:', error);
        showToast('Failed to process refund. Please try again.', 'error');
      }
    });
  };
  
  // Loading state
  if (isQrLoading || isTransactionLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading refund details...</p>
      </div>
    );
  }
  
  // Error state
  if (isQrError || isTransactionError || !qrData || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold text-center mb-4">
          Error loading refund information. Please try again.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full p-4">
      
      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Customer</h2>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Name</span>
          <span className="font-medium">{qrData.customer.name}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">QR Code</span>
          <span className="font-medium">{qrCode.substring(0, 8)}...</span>
        </div>
      </div>
      
      {/* Original Transaction */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Original Transaction</h2>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Transaction ID</span>
          <span className="font-medium">{transaction.id.substring(0, 8)}...</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium">R {formatAmount(transaction.amountCents)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Operator</span>
          <span className="font-medium">{transaction.operatorName}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Date</span>
          <span className="font-medium">
            {timestampToDate(transaction.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Refund Amount */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Refund Amount</h2>
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-indigo-600">R {formatAmount(refundAmount)}</p>
        </div>
      </div>
      
      {/* Confirm Button */}
      <div className="mt-auto">
        <button
          onClick={handleConfirmRefund}
          disabled={isRefundPending}
          className={`w-full py-3 px-4 rounded-md text-white font-semibold transition duration-200 ${
            isRefundPending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isRefundPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing Refund...
            </div>
          ) : (
            'Confirm Refund'
          )}
        </button>
      </div>
    </div>
  );
}

export default RefundsStep4Page;