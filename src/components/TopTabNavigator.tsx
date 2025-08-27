import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Tab {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface TopTabNavigatorProps {
  tabs: Tab[];
}

const TopTabNavigator: React.FC<TopTabNavigatorProps> = ({ tabs }) => {
  const location = useLocation();

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex justify-between px-4 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center py-2 px-3 border-b-2 font-medium flex-1 ${
              location.pathname === tab.path
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="w-6 h-6">
              {tab.icon}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TopTabNavigator;