import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQRCodeCustomer } from '../../../../../queries/qrCodes';
import { useTransaction } from '../../../../../queries/transactions';
import { useCreateTransactionMutation } from '@/mutations/useCreateTransactionMutation';
import { useMyAssignment } from '../../../../../contexts/MyAssignmentContext';
import { useToast } from '../../../../../contexts/ToastContext';
import { timestampToDate } from '@/shared/utils';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
function RefundsStep4Page(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  // Get URL parameters
  const { qrCode: locationQrCode, idempotencyKey, transactionId: locationTransactionId, amountCents: locationRefundAmount } = location.state || {};
  
  const qrCode = locationQrCode;
  const transactionId = locationTransactionId;
  const refundAmount = locationRefundAmount;
  
  // Get current operator information
  const { assignment } = useMyAssignment();
  const operatorId = assignment?.id || '';
  const operatorName = assignment?.userName || '';
  
  // Fetch customer details
  const { data: qrData, isLoading: isQrLoading, isError: isQrError } = useQRCodeCustomer(qrCode);
  
  // Redirect to previous steps if they are not complete
  
  // Fetch original transaction details
  const { data: transaction, isLoading: isTransactionLoading, isError: isTransactionError } = useTransaction(transactionId);
  
  // Refund mutation
  const { mutate: createRefund, isPending: isRefundPending } = useCreateTransactionMutation();
  
  // Format amount for display (in Rands)
  const formatAmount = (cents: number) => {
    const rands = cents / 100;
    return rands.toFixed(2);
  };
  
  const { t } = useTranslation();
  
  // Handle confirm refund button click
  const handleConfirmRefund = () => {
    if (!qrData || !transaction || !operatorId) {
      showToast(t('refundsStep4.missingInfo'), 'error');
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
        showToast(t('refundsStep4.refundProcessedSuccess'), 'success');
        // Reset the refunds flow after successful refund
        useFlowStore.getState().clearFlow();
        // Navigate back to home page
        navigate('/');
      },
      onError: (error: any) => {
        console.error('Refund error:', error);
        showToast(t('refundsStep4.failedToProcessRefund'), 'error');
      }
    });
  };
  
  // Loading state
  if (isQrLoading || isTransactionLoading) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">{t('refundsStep4.loadingRefundDetails')}</p>
        </div>
      </FlowContainer>
    );
  }
  
  // Error state
  if (isQrError || isTransactionError || !qrData || !transaction) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold text-center mb-4">
            {t('refundsStep4.errorLoadingRefundInfo')}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {t('refundsStep4.goBack')}
          </button>
        </div>
      </FlowContainer>
    );
  }
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      
      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('refundsStep4.customer')}</h2>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t('refundsStep4.name')}</span>
          <span className="font-medium">{qrData?.customer.name}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">{t('refundsStep4.qrCode')}</span>
          <span className="font-medium">{qrCode?.substring(0, 8) + '...'}</span>
        </div>
      </div>
      
      {/* Original Transaction */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('refundsStep4.originalTransaction')}</h2>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t('refundsStep4.transactionId')}</span>
          <span className="font-medium">{transaction?.id?.substring(0, 8) + '...'}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">{t('refundsStep4.amount')}</span>
          <span className="font-medium">R {formatAmount(transaction?.amountCents || 0)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">{t('refundsStep4.operator')}</span>
          <span className="font-medium">{transaction?.operatorName || 'Unknown Operator'}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">{t('refundsStep4.date')}</span>
          <span className="font-medium">
            {transaction?.createdAt ? timestampToDate(transaction.createdAt).toLocaleDateString() : 'Unknown Date'}
          </span>
        </div>
      </div>
      
      {/* Refund Amount */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('refundsStep4.refundAmount')}</h2>
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-indigo-600">R {formatAmount(refundAmount || 0)}</p>
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
              {t('refundsStep4.processingRefund')}
            </div>
          ) : (
            t('refundsStep4.confirmRefund')
          )}
        </button>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep4Page;