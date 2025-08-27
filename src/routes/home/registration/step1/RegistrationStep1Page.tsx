import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegistrationStep1Page(): React.JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that name and phone number are not empty
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    
    // Clear any previous error
    setError('');
    
    // Navigate to the next step with name and phone number as URL parameters
    navigate(`/home/registration/step2?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phoneNumber)}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration - Step 1</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h2>
        <p className="text-gray-600">Enter the customer's basic information to begin registration.</p>
      </div>
      
      <form onSubmit={handleNext}>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">Name</p>
              <p className="text-sm text-gray-500">Customer's full name</p>
            </div>
            <div className="text-lg font-semibold text-gray-600">
              Required
            </div>
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter customer's name"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">Phone Number</p>
              <p className="text-sm text-gray-500">Customer's contact number</p>
            </div>
            <div className="text-lg font-semibold text-gray-600">
              Required
            </div>
          </div>
          <div className="mt-3">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
        >
          Next
        </button>
      </form>
    </div>
  );
}

export default RegistrationStep1Page;