import React, { ComponentType } from 'react';
import { useTutorialStore } from '../shared/stores/tutorialStore';

// Define the props that will be injected by the HOC
export interface WithTutorialProps {
  isTutorial: boolean;
  tutorialStep: number;
  totalTutorialSteps: number;
  mockData: any;
  onNextStep: () => void;
  onPrevStep: () => void;
  onCompleteTutorial: () => void;
}

// Define the type for the wrapped component's props
// It should accept the original props plus the injected tutorial props
export type WithTutorialComponentProps<P> = P & WithTutorialProps;

const withTutorial = <P extends object>(
  WrappedComponent: ComponentType<WithTutorialComponentProps<P>>,
  tutorialType: 'sales' | 'checkout' | 'registration'
) => {
  const WithTutorialComponent: React.FC<P> = (props) => {
    const {
      currentTutorial,
      currentStep,
      totalSteps,
      mockData,
      setCurrentTutorial,
      setCurrentStep,
      setTotalSteps,
      setSalesTutorialCompleted,
      setCheckoutTutorialCompleted,
      setRegistrationTutorialCompleted,
    } = useTutorialStore();

    // Initialize tutorial when component mounts
    React.useEffect(() => {
      setCurrentTutorial(tutorialType);
      // Set the total steps based on the tutorial type
      // This would need to be customized for each tutorial type
      if (tutorialType === 'sales') {
        setTotalSteps(3);
      } else if (tutorialType === 'checkout') {
        setTotalSteps(3);
      } else if (tutorialType === 'registration') {
        setTotalSteps(3);
      }
      
      // Set the initial step to 1
      setCurrentStep(1);
      
      // Cleanup when component unmounts
      return () => {
        setCurrentTutorial(null);
      };
    }, [tutorialType, setCurrentTutorial, setTotalSteps, setCurrentStep]);

    const onNextStep = () => {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    };

    const onPrevStep = () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    };

    const onCompleteTutorial = () => {
      // Mark tutorial as completed based on type
      if (tutorialType === 'sales') {
        setSalesTutorialCompleted(true);
      } else if (tutorialType === 'checkout') {
        setCheckoutTutorialCompleted(true);
      } else if (tutorialType === 'registration') {
        setRegistrationTutorialCompleted(true);
      }
      
      // Mark tutorial as completed in AuthContext if all tutorials are completed
      // For now, we'll just mark the current tutorial as completed
      // In a real implementation, you might want to check if all tutorials are completed
      
      // Reset current tutorial
      setCurrentTutorial(null);
    };

    // Inject tutorial props
    const tutorialProps: WithTutorialProps = {
      isTutorial: currentTutorial === tutorialType,
      tutorialStep: currentStep,
      totalTutorialSteps: totalSteps,
      mockData: mockData[tutorialType],
      onNextStep,
      onPrevStep,
      onCompleteTutorial,
    };

    // Pass both original props and tutorial props to the wrapped component
    return <WrappedComponent {...props} {...tutorialProps} />;
  };

  // Set display name for debugging
  WithTutorialComponent.displayName = `WithTutorial(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithTutorialComponent;
};

export default withTutorial;