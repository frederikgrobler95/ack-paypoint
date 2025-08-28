import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';

// Define the steps for the registration step 1 tutorial
const registrationStep1TutorialSteps = [
  {
    target: '.customer-details-section',
    content: 'This section allows you to enter customer details for registration.',
    disableBeacon: true,
  },
  {
    target: '.name-input',
    content: 'Enter the customer\'s full name in this field.',
  },
  {
    target: '.phone-input',
    content: 'Enter the customer\'s phone number. This is required for registration.',
  },
  
];

function RegistrationStep1PageTutorial() {
  const navigate = useNavigate();
  const { mockRegistrationData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const [name, setName] = useState(mockRegistrationData.customerName);
  const [phone, setPhone] = useState(mockRegistrationData.customerPhone);
  const [error, setError] = useState('');
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    
    setError('');
    
    // Navigate to next step
    navigateToNextTutorialStep('/tutorial/registration/step1');
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={registrationStep1TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration Tutorial - Step 1: Customer Details</h1> */}
        
        {/* <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to enter customer details for registration.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div> */}
        
        {/* <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Name:</span> {mockRegistrationData.customerName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {mockRegistrationData.customerPhone}
            </p>
          </div>
        </div> */}
        
        <form onSubmit={handleNext}>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">Name</p>
                <p className="text-sm text-gray-500">Customer's full name</p>
              </div>
              <div className="text-lg font-semibold text-gray-600">
                Required
              </div>
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter customer's name"
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">Phone Number</p>
                <p className="text-sm text-gray-500">Customer's contact number</p>
              </div>
              <div className="text-lg font-semibold text-gray-600">
                Required
              </div>
            </div>
            <div className="mt-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="phone-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            Next
          </button>
        </form>
      </div>
      
      {/* Tutorial Navigation */}
     
    </FlowContainer>
  );
}

export default RegistrationStep1PageTutorial;