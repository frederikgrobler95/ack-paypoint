import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTranslation } from 'react-i18next';

function CheckoutStep2PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the checkout step 2 tutorial
  const checkoutStep2TutorialSteps = [
    {
      target: '.customer-details-section',
      content: t('tutorial.checkout.step2.customerDetailsContent'),
      disableBeacon: true,
    },
    {
      target: '.payment-method-section',
      content: t('tutorial.checkout.step2.paymentMethodContent'),
    },
  ];
  const { mockCheckoutData } = useTutorialStore();
  const { setCheckoutStepComplete } = useTutorialStore();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | 'eft' | null>(null);
  const [error, setError] = useState('');
  
  const handlePaymentMethodSelect = (method: 'card' | 'cash' | 'eft') => {
    setSelectedMethod(method);
    setError('');
  };
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      setError(t('tutorial.checkout.step2.error.paymentMethodRequired'));
      return;
    }
    
    setError('');
    
    // Navigate to next step
    setCheckoutStepComplete(2);
    navigate('/tutorial/checkout/step3');
  };
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutStep2TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        
        
        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 customer-details-section">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('tutorial.checkout.step2.customerDetailsTitle')}</h2>
          <div className="mb-4">
            <p className="text-gray-600">{t('tutorial.checkout.step2.nameLabel')}</p>
            <p className="text-lg font-semibold text-gray-900">{mockCheckoutData.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('tutorial.checkout.step2.outstandingAmountLabel')}</p>
            <p className="text-xl font-bold text-red-600">{formatAmount(mockCheckoutData.amountCents)}</p>
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 payment-method-section">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('tutorial.checkout.step2.paymentMethodTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('tutorial.checkout.step2.selectPaymentMethodMessage')}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handlePaymentMethodSelect('card')}
              className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition duration-200 ${
                selectedMethod === 'card' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{t('tutorial.checkout.step2.cardLabel')}</p>
                  <p className="text-sm text-gray-500">{t('tutorial.checkout.step2.cardDescription')}</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedMethod === 'card' ? t('tutorial.checkout.step2.selectedLabel') : t('tutorial.checkout.step2.selectButton')}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('cash')}
              className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition duration-200 ${
                selectedMethod === 'cash' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{t('tutorial.checkout.step2.cashLabel')}</p>
                  <p className="text-sm text-gray-500">{t('tutorial.checkout.step2.cashDescription')}</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedMethod === 'cash' ? t('tutorial.checkout.step2.selectedLabel') : t('tutorial.checkout.step2.selectButton')}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('eft')}
              className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition duration-200 ${
                selectedMethod === 'eft' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{t('tutorial.checkout.step2.eftLabel')}</p>
                  <p className="text-sm text-gray-500">{t('tutorial.checkout.step2.eftDescription')}</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedMethod === 'eft' ? t('tutorial.checkout.step2.selectedLabel') : t('tutorial.checkout.step2.selectButton')}
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
        >
          {t('tutorial.checkout.step2.nextButton')}
        </button>
      </div>
      
      {/* Tutorial Navigation */}
     
    </FlowContainer>
  );
}

export default CheckoutStep2PageTutorial;