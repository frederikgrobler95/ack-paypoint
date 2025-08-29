import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface DropdownMenuProps {
  onLogout: () => void;
  additionalItems?: MenuItem[];
}

function DropdownMenu({ onLogout, additionalItems = [] }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative z-5" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="text-neutral-50 hover:text-gray-300 focus:outline-none"
        aria-label="User menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          {additionalItems.map((item, index) => (
            <Button
              key={index}
              variant="secondary"
              size="small"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full justify-start"
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant="danger"
            size="small"
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full justify-start"
          >
            Log Out
          </Button>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;