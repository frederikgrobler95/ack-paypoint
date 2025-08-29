import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MockHeader from './MockHeader';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '../../contexts/AuthContext';
import GlobalSpinner from './GlobalSpinner';
import ToastContainer from './ToastContainer';

interface MobileAppContainerProps {
  children: React.ReactNode;
  disablePadding?: boolean;
  disableHeader?: boolean;
  disableBottomNavigation?: boolean;
}

const MobileAppContainer: React.FC<MobileAppContainerProps> = ({
  children,
  disablePadding = false,
  disableHeader = false,
  disableBottomNavigation = false
}) => {
  const location = useLocation();
  const { role } = useAuth();

  const isTutorialMode = location.pathname.startsWith('/tutorial');
  
  // Calculate padding classes
  const paddingClasses = disablePadding
    ? ''
    : isTutorialMode
      ? 'pt-20 pb-20'
      : 'pt-20 pb-20';

  return (
    <div className="min-h-screen flex flex-col p-safe">
      <GlobalSpinner />
      <ToastContainer />
      

      {!disableHeader && (
        isTutorialMode ? (
          <MockHeader autoOpenDropdown={location.pathname === '/tutorial/refunds'} />
        ) : (
          <Header />
        )
      )}

      <main className={`flex-grow overflow-auto ${paddingClasses}`}>
        {children}
      </main>

      {!disableBottomNavigation && !isTutorialMode && role !== 'member' && <BottomNavigation />}
    </div>
  );
};

export default MobileAppContainer;