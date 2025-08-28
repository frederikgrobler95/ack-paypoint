import { useAuth } from '../contexts/AuthContext';
import { updateUserTutorialStatus, markTutorialAsCompleted, markAllTutorialsAsCompleted, resetUserTutorial } from '../services/auth';

interface TutorialState {
  tutorialEnabled: boolean;
  tutorialCompleted: boolean;
  salesTutorialCompleted: boolean;
  checkoutTutorialCompleted: boolean;
  registrationTutorialCompleted: boolean;
}

interface TutorialMethods {
  markTutorialCompleted: (tutorialType?: 'sales' | 'checkout' | 'registration') => Promise<void>;
  resetTutorial: () => Promise<void>;
  isTutorialActive: () => boolean;
  updateTutorialStatus: (tutorialData: Partial<TutorialState>) => Promise<void>;
}

export const useTutorial = (): TutorialState & TutorialMethods => {
  const {
    currentUser,
    tutorialEnabled,
    tutorialCompleted,
    salesTutorialCompleted,
    checkoutTutorialCompleted,
    registrationTutorialCompleted,
    setTutorialEnabled,
    setTutorialCompleted,
    setSalesTutorialCompleted,
    setCheckoutTutorialCompleted,
    setRegistrationTutorialCompleted
  } = useAuth();

  const updateTutorialStatus = async (tutorialData: Partial<TutorialState>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await updateUserTutorialStatus(currentUser.uid, tutorialData);
      
      // Update local state
      if (tutorialData.tutorialEnabled !== undefined) {
        await setTutorialEnabled(tutorialData.tutorialEnabled);
      }
      if (tutorialData.tutorialCompleted !== undefined) {
        await setTutorialCompleted(tutorialData.tutorialCompleted);
      }
      if (tutorialData.salesTutorialCompleted !== undefined) {
        await setSalesTutorialCompleted(tutorialData.salesTutorialCompleted);
      }
      if (tutorialData.checkoutTutorialCompleted !== undefined) {
        await setCheckoutTutorialCompleted(tutorialData.checkoutTutorialCompleted);
      }
      if (tutorialData.registrationTutorialCompleted !== undefined) {
        await setRegistrationTutorialCompleted(tutorialData.registrationTutorialCompleted);
      }
    } catch (error) {
      console.error('Error updating tutorial status:', error);
      throw error;
    }
  };

  const markTutorialCompleted = async (tutorialType?: 'sales' | 'checkout' | 'registration') => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      if (tutorialType) {
        // Mark a specific tutorial as completed
        await markTutorialAsCompleted(currentUser.uid, tutorialType);
        
        // Update local state
        switch (tutorialType) {
          case 'sales':
            await setSalesTutorialCompleted(true);
            break;
          case 'checkout':
            await setCheckoutTutorialCompleted(true);
            break;
          case 'registration':
            await setRegistrationTutorialCompleted(true);
            break;
        }
      } else {
        // Mark all tutorials as completed
        await markAllTutorialsAsCompleted(currentUser.uid);
        await setTutorialCompleted(true);
        await setTutorialEnabled(false);
      }
    } catch (error) {
      console.error('Error marking tutorial as completed:', error);
      throw error;
    }
  };

  const resetTutorial = async () => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await resetUserTutorial(currentUser.uid);
      
      // Update local state
      await setTutorialEnabled(true);
      await setTutorialCompleted(false);
      await setSalesTutorialCompleted(false);
      await setCheckoutTutorialCompleted(false);
      await setRegistrationTutorialCompleted(false);
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      throw error;
    }
  };

  const isTutorialActive = () => {
    return tutorialEnabled && !tutorialCompleted;
  };

  return {
    // State
    tutorialEnabled,
    tutorialCompleted,
    salesTutorialCompleted,
    checkoutTutorialCompleted,
    registrationTutorialCompleted,
    
    // Methods
    markTutorialCompleted,
    resetTutorial,
    isTutorialActive,
    updateTutorialStatus
  };
};