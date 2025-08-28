import React, { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface TutorialRouteWrapperProps {
  children: ReactNode;
  requiredTutorial?: 'sales' | 'registration' | 'checkout';
}

const TutorialRouteWrapper: React.FC<TutorialRouteWrapperProps> = ({ 
  children, 
  requiredTutorial 
}) => {
  const { 
    currentUser, 
    loading, 
    tutorialEnabled, 
    tutorialCompleted,
    salesTutorialCompleted,
    registrationTutorialCompleted,
    checkoutTutorialCompleted
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle loading state
    if (loading) return;

    // If user is not authenticated, redirect to auth
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // If tutorial is completed and we're on a tutorial page, redirect to normal app
    if (tutorialCompleted && location.pathname.startsWith('/tutorial')) {
      navigate('/');
      return;
    }

    // If tutorial is enabled and we're not on a tutorial page
    if (tutorialEnabled && !tutorialCompleted && !location.pathname.startsWith('/tutorial')) {
      // Redirect to the appropriate tutorial page based on completion status
      // Priority order: Sales → Registration → Checkout
      if (!salesTutorialCompleted) {
        navigate('/tutorial/sales');
        return;
      } else if (!registrationTutorialCompleted) {
        navigate('/tutorial/registration');
        return;
      } else if (!checkoutTutorialCompleted) {
        navigate('/tutorial/checkout');
        return;
      }
    }

    // If this route requires a specific tutorial and that tutorial is already completed
    if (requiredTutorial) {
      const tutorialCompletedMap = {
        sales: salesTutorialCompleted,
        registration: registrationTutorialCompleted,
        checkout: checkoutTutorialCompleted
      };

      // If we're not in tutorial mode but the required tutorial is completed, 
      // allow access to the normal route
      if (!location.pathname.startsWith('/tutorial') && tutorialCompletedMap[requiredTutorial]) {
        return; // Allow normal access
      }

      // If we're in tutorial mode but on a different tutorial
      if (location.pathname.startsWith('/tutorial')) {
        const tutorialPathMap = {
          sales: '/tutorial/sales',
          registration: '/tutorial/registration',
          checkout: '/tutorial/checkout'
        };

        // If we're on a different tutorial path, redirect to the correct one
        if (!location.pathname.startsWith(tutorialPathMap[requiredTutorial])) {
          navigate(tutorialPathMap[requiredTutorial]);
          return;
        }
      }
    }
  }, [
    currentUser, 
    loading, 
    tutorialEnabled, 
    tutorialCompleted,
    salesTutorialCompleted,
    registrationTutorialCompleted,
    checkoutTutorialCompleted,
    requiredTutorial,
    location.pathname,
    navigate
  ]);

  // Show loading state while checking auth/tutorial status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render children
  if (!currentUser) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default TutorialRouteWrapper;