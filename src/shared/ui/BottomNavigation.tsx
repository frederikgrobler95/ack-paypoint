import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function BottomNavigation(): React.JSX.Element {
  const { role } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            location.pathname === '/' 
              ? 'text-indigo-600 font-medium' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>Home</span>
        </Link>
        
        {role === 'admin' && (
          <Link 
            to="/admin" 
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin') 
                ? 'text-indigo-600 font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default BottomNavigation;