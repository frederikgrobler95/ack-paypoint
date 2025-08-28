import React from 'react';
import { useTutorialStore } from '../stores/tutorialStore';

interface TutorialFABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'red' | 'indigo';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const TutorialFAB: React.FC<TutorialFABProps> = ({
  onClick,
  icon = <span className="text-xl">+</span>,
  color = 'indigo',
  position = 'bottom-right'
}) => {
  const { onCompleteTutorial } = useTutorialStore();
  
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-20 right-6';
      case 'bottom-left':
        return 'bottom-20 left-6';
      case 'top-right':
        return 'top-20 right-6';
      case 'top-left':
        return 'top-20 left-6';
      default:
        return 'bottom-20 right-6';
    }
  };
  
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-600 hover:bg-green-700';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'red':
        return 'bg-red-600 hover:bg-red-700';
      case 'indigo':
        return 'bg-indigo-600 hover:bg-indigo-700';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };
  
  const handleTutorialExit = () => {
    if (window.confirm('Are you sure you want to exit the tutorial?')) {
      onCompleteTutorial();
    }
  };
  
  return (
    <div className={`fixed ${getPositionClasses()} flex flex-col items-center space-y-4`}>
      {/* Exit Tutorial Button */}
      <button
        onClick={handleTutorialExit}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        title="Exit Tutorial"
      >
        <span className="text-lg">✕</span>
      </button>
      
      {/* Main FAB Button */}
      <button
        onClick={onClick}
        className={`${getColorClasses()} text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105`}
      >
        {icon}
      </button>
    </div>
  );
};

export default TutorialFAB;