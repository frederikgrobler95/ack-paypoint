import React, { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMyAssignment } from '../contexts/MyAssignmentContext';
import { StallType } from '../shared/contracts/stall';

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
    tutorialEnabled
  } = useAuth();
  
  const { stall, isLoading: assignmentLoading } = useMyAssignment();
  const navigate = useNavigate();
  const location = useLocation();

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


  useEffect(() => {
    // Handle loading state
    if (loading || assignmentLoading) return;

    // If user is not authenticated, redirect to auth
    if (!currentUser) {
      // Only navigate if we're not already on the auth page
      if (location.pathname !== '/auth') {
        navigate('/auth');
      }
      return;
    }

    // If tutorial is enabled and we're not on a tutorial page
    if (tutorialEnabled && !location.pathname.startsWith('/tutorial')) {
      // If user has a stall assignment, redirect to the appropriate tutorial for their stall
      if (stall?.type) {
        const requiredTutorial = getRequiredTutorialForStall(stall.type);
        // Only navigate if we're not already going to the correct tutorial
        if (location.pathname !== `/tutorial/${requiredTutorial}`) {
          navigate(`/tutorial/${requiredTutorial}`);
        }
        return;
      } else {
        // Fallback: If no stall assignment, redirect to sales tutorial
        if (location.pathname !== '/tutorial/sales') {
          navigate('/tutorial/sales');
        }
        return;
      }
    }

    // If this route requires a specific tutorial
    if (requiredTutorial) {
      // If we're in tutorial mode but on a different tutorial
      if (location.pathname.startsWith('/tutorial')) {
        const tutorialPathMap = {
          sales: '/tutorial/sales',
          registration: '/tutorial/registration',
          checkout: '/tutorial/checkout'
        };

        // If we're on a different tutorial path, redirect to the correct one
        if (!location.pathname.startsWith(tutorialPathMap[requiredTutorial])) {
          // Only navigate if we're not already going to the correct tutorial
          if (location.pathname !== tutorialPathMap[requiredTutorial]) {
            navigate(tutorialPathMap[requiredTutorial]);
          }
          return;
        }
      }
    }
  }, [
    currentUser,
    loading,
    assignmentLoading,
    stall,
    tutorialEnabled,
    requiredTutorial,
    location.pathname
    // Remove navigate from dependencies to prevent unnecessary re-renders
  ]);

  // Show loading state while checking auth/tutorial status
  if (loading || assignmentLoading) {
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