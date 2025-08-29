import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { useCreateCustomerMutation } from '../../../../mutations/useCreateCustomerMutation'
import { useWorkStore } from '../../../../shared/stores/workStore'
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';

function RegistrationStep3Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const location = useLocation()
  const { name, phone, qrCodeId, qrCodeLabel, idempotencyKey } = location.state || {};
  const currentStallId = useWorkStore((state) => state.currentStallId)
  

  const { mutate: createCustomer, isPending, isError, error } = useCreateCustomerMutation()

  const handleConfirmRegistration = () => {
    if (!name || !phone || !qrCodeId || !idempotencyKey) {
      // Or handle this more gracefully
      console.error("Missing registration data");
      return;
    }
    createCustomer({
      customerName: name,
      phone,
      qrCodeId,
      stallId: currentStallId || '',
      idempotencyKey
    }, {
      onSuccess: () => {
        // Reset the registration flow after successful registration
        useFlowStore.getState().clearFlow();
        navigate('/')
      }
    })
  }

  // Error state for missing data
  if (!name || !phone || !qrCodeId || !idempotencyKey) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('registration.step3.title')}</h1>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold mb-4">
              {t('registration.step3.error.missingData')}
            </p>
            <button
              onClick={() => navigate('/registration/step1')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              {t('registration.step3.button.startOver')}
            </button>
          </div>
        </div>
      </FlowContainer>
    );
  }

  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
    
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <p className="text-sm text-gray-500">{t('registration.step3.label.customerName')}</p>
        <p className="text-lg font-bold text-gray-900">{name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <p className="text-sm text-gray-500">{t('registration.step3.label.phoneNumber')}</p>
        <p className="text-lg font-bold text-gray-900">{phone}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <p className="text-sm text-gray-500">{t('registration.step3.label.qrCode')}</p>
        <div className="flex items-center">
          <div className="mr-4">
            <QRCodeCanvas value={qrCodeId} size={128} />
          </div>
          <p className="text-lg font-bold text-gray-900">{qrCodeLabel}</p>
        </div>
      </div>
      
      <div className="fixed bottom-20 right-6">
        <button
          onClick={handleConfirmRegistration}
          disabled={isPending}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-xl">{t('registration.step3.button.confirmRegistration')}</span>
        </button>
      </div>
    </FlowContainer>
  )
}

export default RegistrationStep3Page