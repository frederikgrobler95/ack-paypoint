import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQRCodeCustomer } from '../../../../queries/qrCodes';
import { useCreatePaymentMutation } from '@/mutations/useCreatePaymentMutation';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/shared/contracts/payment';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
import { useTranslation } from 'react-i18next';

function CheckoutStep3Page(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrCode, idempotencyKey, method: paymentMethod } = location.state || {};
  const { t } = useTranslation();
  
  const { data: qrData, isLoading: isQrLoading, isError: isQrError } = useQRCodeCustomer(qrCode);
  const { currentUser } = useAuth();
  const { assignment, stall } = useMyAssignment();
  const { mutate: checkoutCustomer, isPending: isCheckoutLoading, isError: isCheckoutError, error: checkoutError } = useCreatePaymentMutation();
  
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };
  
  // Get payment method display name
  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'card': return t('paymentMethod.card');
      case 'cash': return t('paymentMethod.cash');
      case 'eft': return t('paymentMethod.eft');
      default: return t('paymentMethod.unknown');
    }
  };
  
  // Handle confirm checkout
  const handleConfirmCheckout = () => {
    if (!qrData || !currentUser) return;
    
    checkoutCustomer({
      method: paymentMethod,
      amountCents: qrData.customer.Account.balanceCents,
      operatorId: currentUser.uid,
      customerId: qrData.customer.id,
      idempotencyKey,
      operatorName: currentUser.displayName || currentUser.email || 'Unknown Operator',
      customerName: qrData.customer.name,
      stallId: assignment?.stallId || ''
    }, {
      onSuccess: () => {
        // Reset the checkout flow after successful checkout
        useFlowStore.getState().clearFlow();
        navigate('/');
      },
      onError: (error: any) => {
        console.error('Error processing checkout:', error);
      }
    });
  };
  
  // Loading state for QR code
  if (isQrLoading) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.step3.title')}</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">{t('checkout.step3.loadingCustomerDetails')}</p>
        </div>
      </FlowContainer>
    );
  }
  
  // Error state for QR code
  if (isQrError || !qrData) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.step3.title')}</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">{t('checkout.step3.error.loadingCustomerDetails')}</p>
        </div>
      </FlowContainer>
    );
  }
  
  const { customer } = qrData;
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
 
      
      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('checkout.step3.customerDetailsTitle')}</h2>
        <div className="mb-4">
          <p className="text-gray-600">{t('checkout.step3.nameLabel')}</p>
          <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('checkout.step3.outstandingAmountLabel')}</p>
          <p className="text-xl font-bold text-red-600">{formatAmount(customer.Account.balanceCents)}</p>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('checkout.step3.paymentMethodTitle')}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{getPaymentMethodName(paymentMethod)}</p>
            <p className="text-sm text-gray-500">{t('checkout.step3.selectedPaymentMethodLabel')}</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            {t('checkout.step3.confirmedLabel')}
          </div>
        </div>
      </div>
      
      {/* Confirm Button */}
      <button
        onClick={handleConfirmCheckout}
        disabled={isCheckoutLoading}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white transition duration-200 ${
          isCheckoutLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isCheckoutLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            {t('checkout.step3.processingMessage')}
          </div>
        ) : (
          t('checkout.step3.confirmCheckoutButton')
        )}
      </button>
    </FlowContainer>
  );
}

export default CheckoutStep3Page;