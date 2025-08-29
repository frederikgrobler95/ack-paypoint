import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRouteName } from '../../hooks/useRouteName';
import { shouldShowBackButton } from '../../config/routes';
import { useWorkStore } from '../../shared/stores/workStore';
import Button from './Button';
import InstallButton from './InstallButton';
import DropdownMenu from './DropdownMenu';

interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
  showUserControls?: boolean;
  showBackButton?: boolean;
}

function Header({
  title,
  showNavigation = true,
  showUserControls = true,
  showBackButton
}: HeaderProps): React.JSX.Element {
  const { currentUser, role, signout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeName = useRouteName();
  const currentStallId = useWorkStore((state) => state.currentStallId);
  const currentStallType = useWorkStore((state) => state.currentStallType);
  
  // Use provided title or fall back to route name
  const displayTitle = title || routeName;
  
  // Determine if back button should be shown
  const shouldShowBack = showBackButton !== undefined ? showBackButton : shouldShowBackButton(location.pathname);

  const handleLogout = async () => {
    try {
      await signout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-800 text-neutral-50 py-3 px-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center">
        {shouldShowBack && (
          <button
            onClick={handleBack}
            className="text-neutral-50 hover:text-gray-300 focus:outline-none mr-2 touch-target"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <Link to="/" className="font-bold text-lg">{displayTitle}</Link>
      </div>
      {showUserControls && currentUser && (
        <div className="flex space-x-2">
          <DropdownMenu
            onLogout={handleLogout}
            additionalItems={currentStallId && currentStallType === 'commerce' && location.pathname === '/' ? [
              {
                label: 'Refund',
                onClick: () => navigate('/sales/refunds/refundsstep1')
              }
            ] : []}
          />
        </div>
      )}
    </div>
  );
}

export default Header;