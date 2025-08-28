import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
function RegistrationStep1Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state from location state or with empty values
  const [name, setName] = useState(location.state?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(location.state?.phone || '');
  const [idempotencyKey, setIdempotencyKey] = useState(location.state?.idempotencyKey || '');
  const [error, setError] = useState('');

  useEffect(() => {
    // Generate a new idempotency key only if one doesn't already exist
    if (!idempotencyKey) {
      setIdempotencyKey(`registration_${uuidv4()}`);
    }
  }, [idempotencyKey]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('registration.step1.error.nameRequired'));
      return;
    }
    
    if (!phoneNumber.trim()) {
      setError(t('registration.step1.error.phoneRequired'));
      return;
    }
    
    setError('');
    
    // Set flow data and mark step 1 as complete
    useFlowStore.getState().setFlowData({ step: 1, name, phone: phoneNumber, idempotencyKey });
    // Navigate to the next step with state
    navigate('/registration/step2', {
      state: { name, phone: phoneNumber, idempotencyKey }
    });
  };

  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h2>
        <p className="text-gray-600">Enter the customer's basic information to begin registration.</p>
      </div> */}
      
      <form onSubmit={handleNext}>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{t('registration.step1.label.name')}</p>
              <p className="text-sm text-gray-500">{t('registration.step1.description.name')}</p>
            </div>
            <div className="text-lg font-semibold text-gray-600">
              {t('registration.step1.label.required')}
            </div>
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('registration.step1.placeholder.name')}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{t('registration.step1.label.phoneNumber')}</p>
              <p className="text-sm text-gray-500">{t('registration.step1.description.phoneNumber')}</p>
            </div>
            <div className="text-lg font-semibold text-gray-600">
              {t('registration.step1.label.required')}
            </div>
          </div>
          <div className="mt-3">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('registration.step1.placeholder.phoneNumber')}
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
          {t('registration.step1.button.next')}
        </button>
      </form>
    </FlowContainer>
  );
}

export default RegistrationStep1Page;