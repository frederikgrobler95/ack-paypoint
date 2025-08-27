import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../../../queries/users';
import { useAdminUpdateUserRoleMutation } from '../../../../mutations/useAdminUpdateUserRoleMutation';
import { User } from '../../../../shared/contracts/user';

function RoleSelectionPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id || '');
  const [selectedRole, setSelectedRole] = useState<User['role']>('member');
  
  const mutation = useAdminUpdateUserRoleMutation();
  
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      await mutation.mutateAsync({
        userId: id,
        role: selectedRole,
      });
      
      // Navigate back to users page after successful update
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading user: {(error as Error).message}</p>
          <button 
            onClick={() => navigate('/admin/users')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="text-center">
          <p className="text-red-600">User not found</p>
          <button 
            onClick={() => navigate('/admin/users')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">User Information</h2>
          <p className="text-gray-600">Name: {user.name}</p>
          <p className="text-gray-600">Username: {user.username}</p>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">Current Role: {user.role}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Select New Role</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="admin"
                  name="role"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={() => setSelectedRole('admin')}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="admin" className="ml-3 block text-sm font-medium text-gray-700">
                  Admin
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="member"
                  name="role"
                  value="member"
                  checked={selectedRole === 'member'}
                  onChange={() => setSelectedRole('member')}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="member" className="ml-3 block text-sm font-medium text-gray-700">
                  Member
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoleSelectionPage;