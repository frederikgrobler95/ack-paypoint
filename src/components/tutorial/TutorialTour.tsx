import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTutorialStore } from '../../shared/stores/tutorialStore';

interface TutorialTourProps {
  steps: Step[];
  run?: boolean;
}

const TutorialTour: React.FC<TutorialTourProps> = ({ steps, run = true }) => {
  const {
    onCompleteTutorial
  } = useTutorialStore();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Handle tour completion
    if (status === STATUS.FINISHED) {
      onCompleteTutorial();
    }
  };

  // Add hideCloseButton: true to all steps
  const stepsWithHiddenCloseButton = steps.map(step => ({
    ...step,
    hideCloseButton: true
  }));

  return (
    <Joyride
      steps={stepsWithHiddenCloseButton}
      run={run}
      continuous
      showSkipButton={false}
      showProgress={false}
      scrollToFirstStep
      disableOverlayClose
      disableScrolling={false}
      spotlightPadding={10}
      locale={{
        last: 'Next'
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#3b82f6', // indigo-500
          textColor: '#374151', // gray-700
          width: 300,
          zIndex: 99999, // Increased z-index to ensure it's above navigation
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
        tooltip: {
          zIndex: 99999, // Ensure tooltip is also above navigation
        },
        tooltipContainer: {
          zIndex: 99999, // Ensure tooltip container is above navigation
        },
        overlay: {
          zIndex: 99998, // Overlay should be just below the tooltip
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default TutorialTour;