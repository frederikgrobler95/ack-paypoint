import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQRCodeCustomer } from '../../../../queries/qrCodes'
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
import InfoDialog from '@/shared/ui/InfoDialog';
import { useTranslation } from 'react-i18next';

function CheckoutStep2Page(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { qrCode, idempotencyKey } = location.state || {};
  const { t } = useTranslation();
  
  const { data: qrData, isLoading, isError } = useQRCodeCustomer(qrCode)
  const [showDialog, setShowDialog] = useState(false);
  
  // Redirect to step 1 if step 1 is not complete
  
  // Check if customer has no outstanding amount and show dialog if needed
  useEffect(() => {
    if (qrData?.customer && qrData.customer.Account && qrData.customer.Account.balanceCents === 0) {
      setShowDialog(true);
    }
  }, [qrData]);
  
  const handlePaymentMethodSelect = (method: 'card' | 'cash' | 'eft') => {
    // Mark step 2 as complete
    useFlowStore.getState().setFlowData({ step: 2, method });
    navigate('/checkout/step3', {
      state: { qrCode, idempotencyKey, method }
    });
  }
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`
  }
  
  if (isLoading) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.step2.title')}</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">{t('checkout.step2.loadingCustomerDetails')}</p>
        </div>
      </FlowContainer>
    )
  }
  
  if (isError || !qrData) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.step2.title')}</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">{t('checkout.step2.error.loadingCustomerDetails')}</p>
        </div>
      </FlowContainer>
    )
  }
  
  const { customer } = qrData
  
  return (
    <>
    <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
     
      
      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-3">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('checkout.step2.customerDetailsTitle')}</h2>
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600">{t('checkout.step2.nameLabel')}</p>
          <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">{t('checkout.step2.outstandingAmountLabel')}</p>
          <p className="text-xl font-bold text-red-600">{formatAmount(customer.Account.balanceCents)}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-3">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('checkout.step2.paymentMethodTitle')}</h2>
        
        <div className="space-y-2">
          <button
            onClick={() => handlePaymentMethodSelect('card')}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-3 text-left hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">{t('checkout.step2.cardLabel')}</p>
              <div className="text-lg font-semibold text-blue-600">
                {t('checkout.step2.selectButton')}
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handlePaymentMethodSelect('cash')}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-3 text-left hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">{t('checkout.step2.cashLabel')}</p>
              <div className="text-lg font-semibold text-blue-600">
                {t('checkout.step2.selectButton')}
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handlePaymentMethodSelect('eft')}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-3 text-left hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">{t('checkout.step2.eftLabel')}</p>
              <div className="text-lg font-semibold text-blue-600">
                {t('checkout.step2.selectButton')}
              </div>
            </div>
          </button>
        </div>
      </div>
    </FlowContainer>
    {showDialog && (
      <InfoDialog
        title={t('checkout.step2.noOutstandingAmountTitle')}
        message={t('checkout.step2.noOutstandingAmountMessage')}
        onConfirm={() => navigate('/')}
      />
    )}
    </>
  )
}

export default CheckoutStep2Page