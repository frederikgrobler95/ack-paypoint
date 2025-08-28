import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
        <FlowContainer withHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">Loading customer details...</div>
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
        <FlowContainer withHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">Error loading customer details: {qrError?.message}</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Try Again
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
        <FlowContainer withHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-red-600">Error creating sale: {saleError?.message}</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Start Over
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
        <FlowContainer withHeaderOffset withBottomOffset>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-lg text-gray-600">Invalid QR code or customer not found</div>
              <button
                onClick={() => navigate('/sales/salesstep1')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Start Over
              </button>
            </div>
          </div>
        </FlowContainer>
      </>
    );
  }
  
  return (
    <>
      <FlowContainer withHeaderOffset withBottomOffset>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Confirm Transaction</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{isTutorial ? mockData?.customerName || 'John Doe' : qrData?.customer.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transaction Amount:</span>
              <span className="font-medium text-lg">R {formatAmount(isTutorial ? (mockData?.amountCents || 10000) : amountCents || 0)}</span>
            </div>
          </div>
          
          <button
            onClick={isTutorial ? () => {
              // In tutorial mode, just show a success message and navigate to home
              addToast('Transaction completed successfully', 'success');
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
            {isTutorial ? 'Complete Tutorial' : (isCreatingSale ? 'Processing...' : 'Confirm Transaction')}
          </button>
          
          {isCreatingSale && (
            <div className="mt-4 text-center text-gray-600">
              Processing transaction, please wait...
            </div>
          )}
        </div>
      </FlowContainer>
    </>
  );
}

export default withTutorial(SalesStep3Page, 'sales');