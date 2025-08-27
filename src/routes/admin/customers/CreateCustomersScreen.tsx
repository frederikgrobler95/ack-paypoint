import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCreateCustomersMutation } from '../../../mutations/useAdminCreateCustomersMutation';
import { v4 as uuidv4 } from 'uuid';

function CreateCustomersScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createCustomers, isPending: isCreating } = useAdminCreateCustomersMutation();
  
  // Single customer form state
  const [singleCustomer, setSingleCustomer] = useState({
    name: '',
    phone: '',
  });
  
  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  
  const handleSingleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSingleCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setUploadResult(null);
    }
  };
  
  const handleSingleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(singleCustomer.phone)) {
      alert('Please enter a valid phone number (E.164 format recommended)');
      return;
    }
    
    try {
      // Create customer with mutation
      createCustomers([
        {
          name: singleCustomer.name,
          phoneE164: singleCustomer.phone,
          phoneRaw: singleCustomer.phone,
          qrCodeId: '', // Will be assigned later
          idempotencyKey: uuidv4(),
        }
      ], {
        onSuccess: () => {
          // Reset form and show success
          setSingleCustomer({
            name: '',
            phone: '',
          });
          
          alert('Customer created successfully!');
          navigate('/admin/customers');
        },
        onError: (error: any) => {
          console.error('Error creating customer:', error);
          alert(`Error creating customer: ${error.message || 'Unknown error'}`);
        }
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      alert(`Error creating customer: ${(error as Error).message}`);
    }
  };
  
  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first.');
      return;
    }
    
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length <= 1) {
        throw new Error('CSV file is empty or contains only headers');
      }
      
      // Parse CSV headers (assuming: Name,Phone)
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['Name', 'Phone'];
      
      for (const requiredHeader of requiredHeaders) {
        if (!headers.includes(requiredHeader)) {
          throw new Error(`Missing required column: ${requiredHeader}`);
        }
      }
      
      const customersToCreate: any[] = [];
      const errors: string[] = [];
      
      // Process each line (skip header)
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const customerData: any = {};
          
          headers.forEach((header, index) => {
            customerData[header.toLowerCase()] = values[index] || '';
          });
          
          // Validate required fields
          if (!customerData.name || !customerData.phone) {
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }
          
          // Validate phone number format
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (!phoneRegex.test(customerData.phone)) {
            errors.push(`Row ${i + 1}: Invalid phone number format`);
            continue;
          }
          
          customersToCreate.push({
            name: customerData.name,
            phoneE164: customerData.phone,
            phoneRaw: customerData.phone,
            qrCodeId: '', // Will be assigned later
            idempotencyKey: uuidv4(),
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: ${(error as Error).message}`);
        }
      }
      
      if (customersToCreate.length > 0) {
        // Create customers with mutation
        createCustomers(customersToCreate, {
          onSuccess: () => {
            setUploadResult({
              success: customersToCreate.length,
              errors
            });
            
            if (errors.length === 0) {
              alert(`Successfully created ${customersToCreate.length} customers!`);
              setCsvFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          },
          onError: (error: any) => {
            console.error('Error creating customers:', error);
            alert(`Error creating customers: ${error.message || 'Unknown error'}`);
          }
        });
      } else {
        setUploadResult({
          success: 0,
          errors: ['No valid customers to create']
        });
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(`Error processing CSV: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Customers</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Single Customer Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Single Customer</h2>
            <form onSubmit={handleSingleCustomerSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={singleCustomer.name}
                  onChange={handleSingleCustomerChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={singleCustomer.phone}
                  onChange={handleSingleCustomerChange}
                  required
                  placeholder="+27123456789"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter phone number in E.164 format (e.g., +27123456789)
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/customers')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
          
          {/* CSV Upload Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Bulk Upload Customers (CSV)</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <button 
                    type="button" 
                    onClick={triggerFileSelect}
                    className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                  >
                    Upload a file
                  </button>
                  {' '}or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  CSV format with columns: Name,Phone
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {csvFile && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>Selected file: {csvFile.name}</p>
                  <p>Size: {(csvFile.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleCsvUpload}
                disabled={!csvFile || isUploading || isCreating}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Upload and Process'
                )}
              </button>
              
              {uploadResult && (
                <div className="mt-4 text-left">
                  <h3 className="text-sm font-medium text-gray-900">Upload Results:</h3>
                  <p className="text-sm text-gray-600">Successfully created: {uploadResult.success} customers</p>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Errors:</p>
                      <ul className="mt-1 list-disc list-inside text-sm text-red-600">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800">CSV Format Example</h3>
              <div className="mt-2 text-xs text-blue-700 font-mono bg-white p-2 rounded">
                Name,Phone<br />
                John Doe,+27123456789<br />
                Jane Smith,+27987654321
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCustomersScreen;