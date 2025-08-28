import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

function AddUsersScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Single user form state
  const [singleUser, setSingleUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member'
  });
  
  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  
  const handleSingleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSingleUser(prev => ({
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
  
  const handleSingleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const auth = getAuth();
      const firestore = getFirestore();
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, singleUser.email, singleUser.password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: singleUser.name
      });
      
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        name: singleUser.name,
        username: singleUser.username,
        email: singleUser.email,
        role: singleUser.role,
        tutorialEnabled: true, // Enable tutorial by default for new users
      });
      
      // Reset form and show success
      setSingleUser({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'member'
      });
      
      alert('User created successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${(error as Error).message}`);
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
      
      // Parse CSV headers (assuming: Name,Username,Email,Password,Role)
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['Name', 'Username', 'Email', 'Password', 'Role'];
      
      for (const requiredHeader of requiredHeaders) {
        if (!headers.includes(requiredHeader)) {
          throw new Error(`Missing required column: ${requiredHeader}`);
        }
      }
      
      const successCount = 0;
      const errors: string[] = [];
      
      // Process each line (skip header)
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const userData: any = {};
          
          headers.forEach((header, index) => {
            userData[header.toLowerCase()] = values[index] || '';
          });
          
          // Validate required fields
          if (!userData.name || !userData.username || !userData.email || !userData.password) {
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }
          
          // Validate role
          if (userData.role !== 'admin' && userData.role !== 'member') {
            userData.role = 'member'; // Default to member if invalid
          }
          
          const auth = getAuth();
          const firestore = getFirestore();
          
          // Create user with Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          
          // Update user profile with display name
          await updateProfile(userCredential.user, {
            displayName: userData.name
          });
          
          // Create user document in Firestore
          await setDoc(doc(firestore, 'users', userCredential.user.uid), {
            name: userData.name,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            tutorialEnabled: true, // Enable tutorial by default for new users
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: ${(error as Error).message}`);
        }
      }
      
      setUploadResult({
        success: lines.length - 1 - errors.length,
        errors
      });
      
      if (errors.length === 0) {
        alert(`Successfully created ${lines.length - 1} users!`);
        setCsvFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
        <div className="flex items-center mb-6">
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Single User Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Single User</h2>
            <form onSubmit={handleSingleUserSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={singleUser.name}
                  onChange={handleSingleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={singleUser.username}
                  onChange={handleSingleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={singleUser.email}
                  onChange={handleSingleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={singleUser.password}
                  onChange={handleSingleUserChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={singleUser.role}
                  onChange={handleSingleUserChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
          
          {/* CSV Upload Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Bulk Upload Users (CSV)</h2>
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
                  CSV format with columns: Name,Username,Email,Password,Role
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
                disabled={!csvFile || isUploading}
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
                  <p className="text-sm text-gray-600">Successfully created: {uploadResult.success} users</p>
                  
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
                Name,Username,Email,Password,Role<br />
                John Doe,johndoe,john@example.com,password123,member<br />
                Jane Smith,janes,jane@example.com,password456,admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUsersScreen;