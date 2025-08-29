import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQRCodeCustomer } from '@/queries/qrCodes';
import { useCreateTransactionMutation } from '@/mutations/useCreateTransactionMutation';
import { useToast } from '@/contexts/ToastContext';
import { PaymentMethod } from '@/shared/contracts/payment';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { useSessionStore } from '@/shared/stores/sessionStore';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
function SalesStep3Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast: addToast } = useToast();
  const { assignment, stall } = useMyAssignment();
  const { user } = useSessionStore();
  const displayName = useSessionStore((state) => state.displayName);
  
  const { flowData } = useFlowStore();
  const { qrCode, amountCents, idempotencyKey } = flowData;
  
  
  const { data: qrData, isLoading: isQrLoading, isError: isQrError, error: qrError } = useQRCodeCustomer(qrCode);
  const { mutate: createSale, isPending: isCreatingSale, isError: isSaleError, error: saleError } = useCreateTransactionMutation();
  
  const handleConfirmTransaction = () => {
    if (!qrData || !assignment) return;
    
    const input = {
      amountCents,
      operatorId: user?.uid || '',
      operatorName: displayName || user?.email || 'Unknown Operator',
      customerId: qrData.customer.id,
      customerName: qrData.customer.name,
      stallId: assignment.stallId,
      stallName: stall?.name || '',
      type: 'sale' as const,
      idempotencyKey,
    };
    
    createSale(input, {
      onSuccess: () => {
        addToast('Transaction completed successfully', 'success');
        // Reset the sales flow after successful transaction
        
        useFlowStore.getState().clearFlow();
        navigate('/');
      },
      onError: (error: any) => {
        addToast(t('salesStep3.errorCreatingSale', { error: error.message }), 'error');
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
        <FlowContainer withNoHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">{t('salesStep3.loadingCustomerDetails')}</div>
            </div>
          </div>
        </FlowContainer>
      </>
    );
  }
  
  // Error state for QR code
  if (isQrError) {
    return (
      <>
        <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">{t('salesStep3.errorLoadingCustomerDetails', { error: qrError?.message })}</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                {t('salesStep3.tryAgain')}
              </button>
            </div>
          </div>
        </FlowContainer>
      </>
    );
  }
  
  // Error state for sale creation
  if (isSaleError) {
    return (
      <>
        <FlowContainer withNoHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">{t('salesStep3.errorCreatingSale', { error: saleError?.message })}</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                {t('salesStep3.startOver')}
              </button>
            </div>
          </div>
        </FlowContainer>
      </>
    );
  }
  
  // No data state
  if (!qrData) {
    return (
      <>
        <FlowContainer withNoHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">{t('salesStep3.invalidQrCode')}</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                {t('salesStep3.startOver')}
              </button>
            </div>
          </div>
        </FlowContainer>
      </>
    );
  }
  
  return (
    <>
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('salesStep3.confirmTransaction')}</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t('salesStep3.customer')}:</span>
              <span className="font-medium">{qrData?.customer.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t('salesStep3.transactionAmount')}:</span>
              <span className="font-medium text-lg">R {formatAmount(amountCents || 0)}</span>
            </div>
          </div>
          
          <button
            onClick={handleConfirmTransaction}
            disabled={isCreatingSale}
            className={`w-full py-3 px-4 rounded-md font-semibold text-neutral-50 transition duration-200 ${
              isCreatingSale
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCreatingSale ? t('salesStep3.processingTransaction') : t('salesStep3.confirmTransaction')}
          </button>
        </div>
      </FlowContainer>
    </>
  );
}

export default SalesStep3Page;