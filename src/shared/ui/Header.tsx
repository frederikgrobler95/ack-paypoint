import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header(): React.JSX.Element {
  const { currentUser, role, signout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <>
      {/* Top navigation for larger screens - hidden on mobile */}
      <nav className="bg-gray-800 text-white py-2 px-4 hidden md:flex">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">PayPoint</Link>
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
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-xs bg-indigo-600 px-2 py-1 rounded">
                  {role === 'admin' ? 'Admin' : 'Member'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1 rounded transition-colors bg-red-600 hover:bg-red-700 text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile-friendly top bar for smaller screens */}
      <div className="bg-gray-800 text-white py-2 px-4 md:hidden flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">PayPoint</Link>
        <div className="flex space-x-2">
          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;