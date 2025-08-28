import { useNavigate } from 'react-router-dom';
import { useTutorial } from './useTutorial';
import { useMyAssignment } from '../contexts/MyAssignmentContext';
import { StallType } from '../shared/contracts/stall';

interface TutorialNavigationHook {
  navigateToNextTutorialStep: (currentPath: string) => void;
  completeTutorialFlow: (tutorialType: 'sales' | 'registration' | 'checkout' | 'refunds') => Promise<void>;
  exitTutorial: () => void;
  navigateToTutorialStep: (tutorialType: 'sales' | 'registration' | 'checkout' | 'refunds', step?: number) => void;
}

export const useTutorialNavigation = (): TutorialNavigationHook => {
  const navigate = useNavigate();
  const { markTutorialCompleted } = useTutorial();
  const { stall } = useMyAssignment();

  // Helper function to map stall type to tutorial type
  const getRequiredTutorialForStall = (stallType: StallType): 'sales' | 'registration' | 'checkout' => {
    switch (stallType) {
      case 'registration':
        return 'registration';
      case 'checkout':
        return 'checkout';
      case 'commerce':
        return 'sales';
      default:
        return 'sales'; // fallback
    }
  };

  /**
   * Navigate to the next step in the tutorial based on current path
   */
  const navigateToNextTutorialStep = (currentPath: string) => {
    // Define tutorial step sequences
    const tutorialSteps: Record<string, string[]> = {
      sales: [
        '/tutorial/sales',
        '/tutorial/sales/step1',
        '/tutorial/sales/step2',
        '/tutorial/sales/step3'
      ],
      registration: [
        '/tutorial/registration',
        '/tutorial/registration/step1',
        '/tutorial/registration/step2',
        '/tutorial/registration/step3'
      ],
      checkout: [
        '/tutorial/checkout',
        '/tutorial/checkout/step1',
        '/tutorial/checkout/step2',
        '/tutorial/checkout/step3'
      ],
      refunds: [
        '/tutorial/refunds',
        '/tutorial/refunds/step1',
        '/tutorial/refunds/step2',
        '/tutorial/refunds/step3',
        '/tutorial/refunds/step4'
      ]
    };

    // Determine which tutorial we're in based on the current path
    let tutorialType: 'sales' | 'registration' | 'checkout' | 'refunds' | null = null;
    if (currentPath.startsWith('/tutorial/sales')) {
      tutorialType = 'sales';
    } else if (currentPath.startsWith('/tutorial/registration')) {
      tutorialType = 'registration';
    } else if (currentPath.startsWith('/tutorial/checkout')) {
      tutorialType = 'checkout';
    } else if (currentPath.startsWith('/tutorial/refunds')) {
      tutorialType = 'refunds';
    }

    if (!tutorialType) {
      console.warn('Could not determine tutorial type from path:', currentPath);
      return;
    }

    const steps = tutorialSteps[tutorialType];
    const currentIndex = steps.indexOf(currentPath);
    
    if (currentIndex === -1) {
      console.warn('Current path not found in tutorial steps:', currentPath);
      // Navigate to the first step of this tutorial
      navigate(steps[0]);
      return;
    }

    // If we're at the last step, navigate to completion page
    if (currentIndex === steps.length - 1) {
      navigate(`/tutorial/${tutorialType}/complete`);
      return;
    }

    // Navigate to the next step
    const nextStep = steps[currentIndex + 1];
    navigate(nextStep);
  };

  /**
   * Complete a tutorial flow and mark it as completed
   */
  const completeTutorialFlow = async (tutorialType: 'sales' | 'registration' | 'checkout' | 'refunds') => {
    try {
      // Only mark tutorial as completed for the original tutorial types
      if (tutorialType !== 'refunds') {
        await markTutorialCompleted(tutorialType);
      }
      
      // Navigate to the completion page
      navigate(`/tutorial/${tutorialType}/complete`);
    } catch (error) {
      console.error('Error completing tutorial flow:', error);
    }
  };

  /**
   * Exit the tutorial and return to the main app
   */
  const exitTutorial = () => {
    navigate('/');
  };

  /**
   * Navigate to a specific tutorial step
   */
  const navigateToTutorialStep = (
    tutorialType: 'sales' | 'registration' | 'checkout' | 'refunds',
    step?: number
  ) => {
    if (step === undefined) {
      // Navigate to the main tutorial page
      navigate(`/tutorial/${tutorialType}`);
      return;
    }

    // Navigate to a specific step
    navigate(`/tutorial/${tutorialType}/step${step}`);
  };

  return {
    navigateToNextTutorialStep,
    completeTutorialFlow,
    exitTutorial,
    navigateToTutorialStep
  };
};