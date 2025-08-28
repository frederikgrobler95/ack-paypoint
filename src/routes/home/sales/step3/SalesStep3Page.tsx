import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQRCodeCustomer } from '@/queries/qrCodes';
import { useCreateTransactionMutation } from '@/mutations/useCreateTransactionMutation';
import { useToast } from '@/contexts/ToastContext';
import { PaymentMethod } from '@/shared/contracts/payment';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { useSessionStore } from '@/shared/stores/sessionStore';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
import { useSalesFlowNavigation } from '@/hooks';
import { withTutorial, WithTutorialProps } from '@/hocs';

function SalesStep3Page({ isTutorial = false, mockData }: WithTutorialProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast: addToast } = useToast();
  const { assignment, stall } = useMyAssignment();
  const { user } = useSessionStore();
  const displayName = useSessionStore((state) => state.displayName);
  
  const { qrCode: locationQrCode, amountCents: locationAmountCents, idempotencyKey } = location.state || {};
  
  // Use mock data in tutorial mode, otherwise use location state
  const qrCode = isTutorial ? mockData?.qrCode || '' : locationQrCode;
  const amountCents = isTutorial ? mockData?.amountCents || 10000 : locationAmountCents;
  
  const salesData = useFlowStore((state) => state.salesData);
  const isSalesStep1Complete = useFlowStore((state) => state.isSalesStepComplete(1));
  const isSalesStep2Complete = useFlowStore((state) => state.isSalesStepComplete(2));
  const resetSalesFlow = useFlowStore((state) => state.resetSalesFlow);
  
  // Redirect to step 1 if step 1 is not complete
  // Redirect to step 2 if step 2 is not complete
  useSalesFlowNavigation(3);
  
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
        resetSalesFlow();
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
        <FlowContainer withNoHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">{t('salesStep3.errorLoadingCustomerDetails', { error: qrError?.message })}</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
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
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
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
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
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
              <span className="font-medium">{isTutorial ? mockData?.customerName || 'John Doe' : qrData?.customer.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t('salesStep3.transactionAmount')}:</span>
              <span className="font-medium text-lg">R {formatAmount(isTutorial ? (mockData?.amountCents || 10000) : amountCents || 0)}</span>
            </div>
          </div>
          
          <button
            onClick={isTutorial ? () => {
              // In tutorial mode, just show a success message and navigate to home
              addToast(t('salesStep3.transactionCompletedSuccess'), 'success');
              // Reset the sales flow after successful transaction
              resetSalesFlow();
              navigate('/');
            } : handleConfirmTransaction}
            disabled={isCreatingSale}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition duration-200 ${
              isCreatingSale
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isTutorial ? t('salesStep3.completeTutorial') : (isCreatingSale ? t('salesStep3.processingTransaction') : t('salesStep3.confirmTransaction'))}
          </button>
          
          {isCreatingSale && (
            <div className="mt-4 text-center text-gray-600">
              {t('salesStep3.processingTransaction')}
            </div>
          )}
        </div>
      </FlowContainer>
    </>
  );
}

export default withTutorial(SalesStep3Page, 'sales');