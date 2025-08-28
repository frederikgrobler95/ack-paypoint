import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRouteName } from '../../hooks/useRouteName';
import { shouldShowBackButton } from '../../config/routes';

interface MockHeaderProps {
  title?: string;
  showNavigation?: boolean;
  showUserControls?: boolean;
  showBackButton?: boolean;
  autoOpenDropdown?: boolean; // New prop to control dropdown state
}

function MockHeader({
  title,
  showNavigation = true,
  showUserControls = true,
  showBackButton,
  autoOpenDropdown = false
}: MockHeaderProps): React.JSX.Element {
  const { currentUser, role } = useAuth();
  const location = useLocation();
  const routeName = useRouteName();
  
  // Use provided title or fall back to route name
  const displayTitle = title || routeName;
  
  // Determine if back button should be shown
  const shouldShowBack = showBackButton !== undefined ? showBackButton : shouldShowBackButton(location.pathname);

  // Mock handlers that do nothing
  const handleMockAction = (e: React.MouseEvent) => {
    e.preventDefault();
    // Optionally show a tooltip or do nothing
  };

  return (
    <>
      {/* Top navigation for larger screens - hidden on mobile */}
      <nav className="bg-gray-800 text-white py-2 px-4 hidden md:flex fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold cursor-default">{displayTitle}</span>
            {showNavigation && (
              <div className="flex space-x-2">
                <button
                  onClick={handleMockAction}
                  className={`px-3 py-2 rounded-md text-sm font-medium cursor-default ${location.pathname === '/' ? "bg-blue-600 text-white" : "text-gray-300"}`}
                >
                  Home
                </button>
                
                {role === 'admin' && (
                  <button
                    onClick={handleMockAction}
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-default ${location.pathname.startsWith('/admin') ? "bg-blue-600 text-white" : "text-gray-300"}`}
                  >
                    Admin
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center flex-1">
            <span className="text-xl font-bold">{displayTitle}</span>
          </div>
          
          <div className="flex justify-end w-1/4">
            {shouldShowBack && (
              <button
                onClick={handleMockAction}
                className="text-white cursor-default focus:outline-none"
                aria-label="Go back (disabled in tutorial)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            
            {showUserControls && currentUser && (
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <span className="text-xs bg-indigo-600 px-2 py-1 rounded">
                    {role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  <MockDropdownMenu autoOpen={autoOpenDropdown} />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile-friendly top bar for smaller screens */}
      <div className="bg-gray-800 text-white py-2 px-4 md:hidden flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          {shouldShowBack && (
            <button
              onClick={handleMockAction}
              className="text-white cursor-default focus:outline-none mr-2"
              aria-label="Go back (disabled in tutorial)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <span className="font-bold text-lg cursor-default">{displayTitle}</span>
        </div>
        {showUserControls && currentUser && (
          <div className="flex space-x-2">
            <MockDropdownMenu autoOpen={autoOpenDropdown} />
          </div>
        )}
      </div>
    </>
  );
}

// Mock dropdown menu component that looks like the real one but doesn't function
function MockDropdownMenu({ autoOpen = false }: { autoOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleMockAction = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false); // Close the dropdown menu
  };
  
  const handleRefundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false); // Close the dropdown menu
    navigate('/tutorial/refunds/step1');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Effect to automatically open the dropdown when autoOpen prop is true
  React.useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  return (
    <div className="relative">
      <button
        className="text-white focus:outline-none header-menu-button opacity-50 cursor-not-allowed"
        aria-label="User menu"
        disabled
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      
      {/* Mock dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-default opacity-50"
            disabled
          >
            Profile
          </button>
          <button
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-default opacity-50"
            disabled
          >
            Settings
          </button>
          <button
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left refunds-link opacity-50"
            disabled
          >
            Refunds
          </button>
          <button
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-default opacity-50"
            disabled
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default MockHeader;