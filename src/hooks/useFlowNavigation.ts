import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '@/shared/stores/flowStore';

// Custom hook for sales flow navigation guard
export const useSalesFlowNavigation = (currentStep: number) => {
  const navigate = useNavigate();
  const isSalesStep1Complete = useFlowStore((state) => state.isSalesStepComplete(1));
  const isSalesStep2Complete = useFlowStore((state) => state.isSalesStepComplete(2));
  
  useEffect(() => {
    // Redirect based on which step is incomplete
    if (currentStep > 1 && !isSalesStep1Complete) {
      navigate('/sales/salesstep1');
    } else if (currentStep > 2 && !isSalesStep2Complete) {
      navigate('/sales/salesstep2');
    }
  }, [currentStep, isSalesStep1Complete, isSalesStep2Complete, navigate]);
};

// Custom hook for registration flow navigation guard
export const useRegistrationFlowNavigation = (currentStep: number) => {
  const navigate = useNavigate();
  const isRegistrationStep1Complete = useFlowStore((state) => state.isRegistrationStepComplete(1));
  const isRegistrationStep2Complete = useFlowStore((state) => state.isRegistrationStepComplete(2));
  
  useEffect(() => {
    // Redirect based on which step is incomplete
    if (currentStep > 1 && !isRegistrationStep1Complete) {
      navigate('/registration/step1');
    } else if (currentStep > 2 && !isRegistrationStep2Complete) {
      navigate('/registration/step2');
    }
  }, [currentStep, isRegistrationStep1Complete, isRegistrationStep2Complete, navigate]);
};

// Custom hook for checkout flow navigation guard
export const useCheckoutFlowNavigation = (currentStep: number) => {
  const navigate = useNavigate();
  const isCheckoutStep1Complete = useFlowStore((state) => state.isCheckoutStepComplete(1));
  const isCheckoutStep2Complete = useFlowStore((state) => state.isCheckoutStepComplete(2));
  
  useEffect(() => {
    // Redirect based on which step is incomplete
    if (currentStep > 1 && !isCheckoutStep1Complete) {
      navigate('/checkout/step1');
    } else if (currentStep > 2 && !isCheckoutStep2Complete) {
      navigate('/checkout/step2');
    }
  }, [currentStep, isCheckoutStep1Complete, isCheckoutStep2Complete, navigate]);
};

// Custom hook for refunds flow navigation guard
export const useRefundsFlowNavigation = (currentStep: number) => {
  const navigate = useNavigate();
  const isRefundsStep1Complete = useFlowStore((state) => state.isRefundsStepComplete(1));
  const isRefundsStep2Complete = useFlowStore((state) => state.isRefundsStepComplete(2));
  const isRefundsStep3Complete = useFlowStore((state) => state.isRefundsStepComplete(3));
  
  useEffect(() => {
    // Redirect based on which step is incomplete
    if (currentStep > 1 && !isRefundsStep1Complete) {
      navigate('/sales/refunds/refundsstep1');
    } else if (currentStep > 2 && !isRefundsStep2Complete) {
      navigate('/sales/refunds/refundsstep2');
    } else if (currentStep > 3 && !isRefundsStep3Complete) {
      navigate('/sales/refunds/refundsstep3');
    }
  }, [currentStep, isRefundsStep1Complete, isRefundsStep2Complete, isRefundsStep3Complete, navigate]);
};