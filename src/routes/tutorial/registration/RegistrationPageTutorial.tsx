import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour, TutorialInfo } from '../../../components/tutorial';
import { useTranslation } from 'react-i18next';

function RegistrationPageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the registration tutorial
  const registrationTutorialSteps = [
    {
      target: '.registrations-overview',
      content: t('tutorial.registration.overviewContent'),
      disableBeacon: true,
    },
    {
      target: '.recent-registrations',
      content: t('tutorial.registration.recentRegistrationsContent'),
    },
    {
      target: '.start-registration-button',
      content: t('tutorial.registration.startRegistrationButtonContent'),
    },
    {
      target: '.tutorial-controls',
      content: t('tutorial.registration.tutorialControlsContent'),
    },
  ];
  const { mockRegistrationData, setCurrentTutorial } = useTutorialStore();
  const { setRegistrationStepComplete } = useTutorialStore();
  const [showInfo, setShowInfo] = useState(true);
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('registration');
  }, [setCurrentTutorial]);
  
  const handleStartTutorial = () => {
    setShowInfo(false);
  };
  
  const handleStartRegistration = () => {
    // Navigate to the first step of the registration tutorial
    setRegistrationStepComplete(1);
    navigate('/tutorial/registration/step1');
  };
  
  // If showInfo is true, render the TutorialInfo component
  if (showInfo) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <TutorialInfo
          title={t('tutorial.registration.welcomeTitle')}
          description={t('tutorial.registration.welcomeDescription')}
          assignedStall="Registration"
          assignedStallName={t('tutorial.registration.assignedStall')}
          onStart={handleStartTutorial}
        />
      </FlowContainer>
    );
  }
  
  // Otherwise, render the main page content
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={registrationTutorialSteps} />
      
      <div className="p-4">
        {/* Registrations Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 registrations-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('tutorial.registration.totalRegistrationsTitle')}</h2>
          <p className="text-3xl font-bold text-blue-600">{mockRegistrationData.totalRegistrations}</p>
          <p className="text-gray-500 text-sm mt-2">{t('tutorial.registration.mockDataMessage')}</p>
        </div>
        
        {/* Recent Registrations */}
        <div className="mb-6 recent-registrations">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('tutorial.registration.recentRegistrationsTitle')}</h2>
          {mockRegistrationData.registrations.length > 0 ? (
            mockRegistrationData.registrations.map((registration: any) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{registration.customerName}</p>
                    <p className="text-gray-500 text-sm">{registration.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">
                      {registration.registrationDate instanceof Date
                        ? registration.registrationDate.toLocaleDateString()
                        : t('tutorial.registration.justNow')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              {t('tutorial.registration.noRegistrationsMessage')}
            </div>
          )}
        </div>
        
        {/* Start Registration Button */}
        <div className="fixed bottom-20 right-6">
          <button
            className="start-registration-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleStartRegistration}
          >
            <span className="text-xl">+</span>
          </button>
        </div>
        
        {/* Tutorial Controls */}
       
      </div>
    </FlowContainer>
  );
}

export default RegistrationPageTutorial;