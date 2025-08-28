import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour, TutorialInfo } from '../../../components/tutorial';
import { useTranslation } from 'react-i18next';

function CheckoutPageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the checkout tutorial
  const checkoutTutorialSteps = [
    {
      target: '.checkout-overview',
      content: t('tutorial.checkout.overviewContent'),
      disableBeacon: true,
    },
    {
      target: '.recent-payments',
      content: t('tutorial.checkout.recentPaymentsContent'),
    },
    {
      target: '.start-checkout-button',
      content: t('tutorial.checkout.startCheckoutButtonContent'),
    },
    {
      target: '.tutorial-controls',
      content: t('tutorial.checkout.tutorialControlsContent'),
    },
  ];
  const { mockCheckoutData, setCurrentTutorial } = useTutorialStore();
  const { setCheckoutStepComplete } = useTutorialStore();
  const [showInfo, setShowInfo] = useState(true);
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('checkout');
  }, [setCurrentTutorial]);
  
  const handleStartTutorial = () => {
    setShowInfo(false);
  };
  
  const handleStartCheckout = () => {
    // Navigate to the first step of the checkout tutorial
    setCheckoutStepComplete(1);
    navigate('/tutorial/checkout/step1');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  // If showInfo is true, render the TutorialInfo component
  if (showInfo) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <TutorialInfo
          title={t('tutorial.checkout.welcomeTitle')}
          description={t('tutorial.checkout.welcomeDescription')}
          assignedStall="some-stall-id"
          assignedStallName={t('tutorial.checkout.assignedStall')}
          onStart={handleStartTutorial}
        />
      </FlowContainer>
    );
  }
  
  // Otherwise, render the main page content
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutTutorialSteps} />
      
      <div className="p-4">
        {/* Checkout Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 checkout-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('tutorial.checkout.totalRevenueLabel')}</h2>
          <p className="text-3xl font-bold text-green-600">R{formatAmount(mockCheckoutData.totalRevenue)}</p>
          <p className="text-gray-500 text-sm mt-2">{t('tutorial.checkout.mockDataMessage')}</p>
        </div>
        
        {/* Recent Payments */}
        <div className="mb-6 recent-payments">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('tutorial.checkout.recentPaymentsTitle')}</h2>
          {mockCheckoutData.payments.length > 0 ? (
            mockCheckoutData.payments.map((payment: any) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{payment.customerName}</p>
                    <p className="text-gray-500 text-sm">{payment.operatorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">R{formatAmount(payment.amountCents)}</p>
                    <p className="text-gray-500 text-sm">
                      {payment.createdAt instanceof Date
                        ? payment.createdAt.toLocaleDateString()
                        : t('tutorial.checkout.justNow')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              {t('tutorial.checkout.noPaymentsMessage')}
            </div>
          )}
        </div>
        
        {/* Start Checkout Button */}
        <div className="fixed bottom-20 right-6">
          <button
            className="start-checkout-button bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleStartCheckout}
          >
            <span className="text-xl">+</span>
          </button>
        </div>
        
        {/* Tutorial Controls */}
       
      </div>
    </FlowContainer>
  );
}

export default CheckoutPageTutorial;