import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAdminReissueCustomerQrMutation } from '../../../mutations/useAdminReissueCustomerQrMutation';
import { useCustomer } from '../../../queries/customers';

function ReissueQrCodePage(): React.JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { data: customer, isLoading: isCustomerLoading } = useCustomer(id || '');
  const { mutate: reissueQr, isPending: isReissuing } = useAdminReissueCustomerQrMutation();
  
  const [newQrCodeId, setNewQrCodeId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Get the new QR code ID from location state if available
  useEffect(() => {
    if (location.state && location.state.newQrCodeId) {
      setNewQrCodeId(location.state.newQrCodeId);
    }
  }, [location.state]);

  const handleReissue = async () => {
    if (!id || !newQrCodeId) {
      setError('Customer ID and new QR code ID are required');
      return;
    }

    try {
      reissueQr(
        { customerId: id, newQrCodeId },
        {
          onSuccess: (data) => {
            if (data.success) {
              alert('QR code reissued successfully!');
              navigate(`/admin/customers/customerdetails/${id}`);
            } else {
              setError(data.message);
            }
          },
          onError: (error: any) => {
            console.error('Error reissuing QR code:', error);
            setError(error.message || 'Failed to reissue QR code');
          }
        }
      );
    } catch (error) {
      console.error('Error reissuing QR code:', error);
      setError((error as Error).message);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (isCustomerLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
        </div>
        
        {customer ? (
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Customer Details</h2>
              <p className="text-gray-600"><span className="font-medium">Name:</span> {customer.name}</p>
              <p className="text-gray-600"><span className="font-medium">Phone:</span> {customer.phone}</p>
              <p className="text-gray-600"><span className="font-medium">Current QR Code:</span> {customer.qrCodeId || 'None'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">New QR Code</h2>
              {newQrCodeId ? (
                <p className="text-gray-600 font-mono break-all">{newQrCodeId}</p>
              ) : (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newQrCodeId}
                    onChange={(e) => setNewQrCodeId(e.target.value)}
                    placeholder="Enter new QR code ID"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleReissue}
                disabled={isReissuing || !newQrCodeId}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isReissuing ? 'Reissuing...' : 'Confirm Reissue'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Customer not found</p>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReissueQrCodePage;