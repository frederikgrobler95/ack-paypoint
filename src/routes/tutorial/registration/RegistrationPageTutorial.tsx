import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour } from '../../../components/tutorial';
import { useTutorialNavigation } from '../../../hooks';

// Define the steps for the registration tutorial
const registrationTutorialSteps = [
  {
    target: '.registrations-overview',
    content: 'This section shows an overview of registrations data in tutorial mode.',
    disableBeacon: true,
  },
  {
    target: '.recent-registrations',
    content: 'This list shows recent registrations. In tutorial mode, these are mock registrations.',
  },
  {
    target: '.start-registration-button',
    content: 'Click this button to start a new registration. This will begin the registration tutorial flow.',
  },
  {
    target: '.tutorial-controls',
    content: 'These controls allow you to navigate through the tutorial or exit at any time.',
  },
];

function RegistrationPageTutorial() {
  const navigate = useNavigate();
  const { mockRegistrationData, setCurrentTutorial } = useTutorialStore();
  const { navigateToTutorialStep, exitTutorial } = useTutorialNavigation();
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('registration');
  }, [setCurrentTutorial]);
  
  const handleStartRegistration = () => {
    // Navigate to the first step of the registration tutorial
    navigateToTutorialStep('registration', 1);
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={registrationTutorialSteps} />
      
      <div className="p-4">
        {/* Registrations Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 registrations-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Registrations (Tutorial)</h2>
          <p className="text-3xl font-bold text-blue-600">{mockRegistrationData.totalRegistrations}</p>
          <p className="text-gray-500 text-sm mt-2">This is mock data for tutorial purposes</p>
        </div>
        
        {/* Recent Registrations */}
        <div className="mb-6 recent-registrations">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Registrations</h2>
          {mockRegistrationData.registrations.length > 0 ? (
            mockRegistrationData.registrations.map((registration) => (
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
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              No registrations yet
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
        <div className="fixed bottom-4 left-0 right-0 bg-white p-4 border-t border-gray-200 tutorial-controls">
          <div className="flex justify-between">
            <button
              onClick={exitTutorial}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Exit Tutorial
            </button>
            
            <button
              onClick={() => navigateToTutorialStep('registration', 1)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RegistrationPageTutorial;