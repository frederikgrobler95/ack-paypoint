import { useAuth } from '../contexts/AuthContext';
import { updateUserTutorialStatus, markTutorialAsCompleted, markAllTutorialsAsCompleted, resetUserTutorial } from '../services/auth';

interface TutorialState {
  tutorialEnabled: boolean;
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
    setTutorialEnabled,
    setTutorialCompleted
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
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      throw error;
    }
  };

  const isTutorialActive = () => {
    return tutorialEnabled;
  };

  return {
    // State
    tutorialEnabled,
    
    // Methods
    markTutorialCompleted,
    resetTutorial,
    isTutorialActive,
    updateTutorialStatus
  };
};