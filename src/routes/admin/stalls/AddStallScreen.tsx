import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCreateStallMutation } from '@/mutations/useAdminCreateStallMutation';

function AddStallScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { mutate: createStall, isPending, isError, error } = useAdminCreateStallMutation();
  
  const [stallData, setStallData] = useState({
    name: '',
    type: 'registration' as 'registration' | 'checkout' | 'commerce',
    totalAmount: 0
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'totalAmount') {
      setStallData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setStallData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For registration stalls, ensure totalAmount is provided
    const stallInput = {
      ...stallData,
      totalAmount: stallData.type === 'registration' ? stallData.totalAmount : 0
    };
    
    createStall(stallInput, {
      onSuccess: () => {
        alert('Stall created successfully!');
        navigate('/admin/stalls');
      },
      onError: (error) => {
        console.error('Error creating stall:', error);
        alert(`Error creating stall: ${error.message}`);
      }
    });
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Stall Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={stallData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Stall Type
            </label>
            <select
              id="type"
              name="type"
              value={stallData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="registration">Registration</option>
              <option value="checkout">Checkout</option>
              <option value="commerce">Commerce</option>
            </select>
          </div>
          
      
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/stalls')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Stall'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStallScreen;