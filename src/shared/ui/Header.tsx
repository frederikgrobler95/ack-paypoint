import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRouteName } from '../../hooks/useRouteName';
import { shouldShowBackButton } from '../../config/routes';
import Button from './Button';
import InstallButton from './InstallButton';

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
    <>
      {/* Top navigation for larger screens - hidden on mobile */}
      <nav className="bg-gray-800 text-white py-2 px-4 hidden md:flex fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">{displayTitle}</Link>
            {showNavigation && (
              <div className="flex space-x-2">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Home
                </Link>
                
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname.startsWith('/admin') ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                  >
                    Admin
                  </Link>
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
                onClick={handleBack}
                className="text-white hover:text-gray-300 focus:outline-none"
                aria-label="Go back"
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
                  <InstallButton />
                  <Button
                    variant="danger"
                    size="small"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
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
              onClick={handleBack}
              className="text-white hover:text-gray-300 focus:outline-none mr-2"
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
            <InstallButton />
            <Button
              variant="danger"
              size="small"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default Header;