import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTutorialStore } from '../../shared/stores/tutorialStore';

interface TutorialTourProps {
  steps: Step[];
  run?: boolean;
}

const TutorialTour: React.FC<TutorialTourProps> = ({ steps, run = true }) => {
  const {
    currentStep,
    setCurrentStep,
    onCompleteTutorial
  } = useTutorialStore();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Update current step when it changes
    if (type === 'step:after') {
      setCurrentStep(index + 1);
    }

    // Handle tour completion
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onCompleteTutorial();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose
      disableScrolling={false}
      spotlightPadding={10}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#3b82f6', // indigo-500
          textColor: '#374151', // gray-700
          width: 300,
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#3b82f6', // indigo-500
        },
        buttonBack: {
          color: '#6b7280', // gray-500
        },
        buttonSkip: {
          color: '#6b7280', // gray-500
        },
      }}
      callback={handleJoyrideCallback}
      stepIndex={currentStep - 1} // Joyride uses 0-based index
    />
  );
};

export default TutorialTour;