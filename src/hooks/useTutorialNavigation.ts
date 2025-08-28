import { useNavigate } from 'react-router-dom';
import { useTutorial } from './useTutorial';

interface TutorialNavigationHook {
  navigateToNextTutorialStep: (currentPath: string) => void;
  completeTutorialFlow: (tutorialType: 'sales' | 'registration' | 'checkout') => Promise<void>;
  exitTutorial: () => void;
  navigateToTutorialStep: (tutorialType: 'sales' | 'registration' | 'checkout', step?: number) => void;
}

export const useTutorialNavigation = (): TutorialNavigationHook => {
  const navigate = useNavigate();
  const { markTutorialCompleted } = useTutorial();

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
      ]
    };

    // Determine which tutorial we're in based on the current path
    let tutorialType: 'sales' | 'registration' | 'checkout' | null = null;
    if (currentPath.startsWith('/tutorial/sales')) {
      tutorialType = 'sales';
    } else if (currentPath.startsWith('/tutorial/registration')) {
      tutorialType = 'registration';
    } else if (currentPath.startsWith('/tutorial/checkout')) {
      tutorialType = 'checkout';
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

    // If we're at the last step, complete the tutorial
    if (currentIndex === steps.length - 1) {
      completeTutorialFlow(tutorialType);
      return;
    }

    // Navigate to the next step
    const nextStep = steps[currentIndex + 1];
    navigate(nextStep);
  };

  /**
   * Complete a tutorial flow and mark it as completed
   */
  const completeTutorialFlow = async (tutorialType: 'sales' | 'registration' | 'checkout') => {
    try {
      await markTutorialCompleted(tutorialType);
      
      // Navigate to the next incomplete tutorial or home if all completed
      switch (tutorialType) {
        case 'sales':
          // After completing sales, go to registration if not completed
          navigate('/tutorial/registration');
          break;
        case 'registration':
          // After completing registration, go to checkout if not completed
          navigate('/tutorial/checkout');
          break;
        case 'checkout':
          // After completing checkout, all tutorials are done
          // The App.tsx redirect logic should handle navigating to home
          navigate('/');
          break;
      }
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
    tutorialType: 'sales' | 'registration' | 'checkout', 
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