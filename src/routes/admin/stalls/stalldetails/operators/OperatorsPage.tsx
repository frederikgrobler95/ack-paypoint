import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUsers } from '@/queries/users'
import { useAssignmentsByStall } from '@/queries/assignments'
import { useAssignOperatorsMutation } from '@/mutations/useAdminAssignOperatorsMutation'
import { useStall } from '@/queries/stalls'
import { SharedList } from '@/shared/ui'
import { User } from '@/shared/contracts/user'
import { Assignment } from '@/shared/contracts/assignment'
import { Stall } from '@/shared/contracts/stall'
import { useToast } from '@/contexts/ToastContext'

function OperatorsPage(): React.JSX.Element {
  const { id: stallId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch all users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useUsers()
  
  // Fetch the stall data
  const {
    data: stallData,
    isLoading: isLoadingStall,
    error: stallError
  } = useStall(stallId || '')
  
  // Fetch current assignments for this stall
  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    error: assignmentsError,
    refetch: refetchAssignments
  } = useAssignmentsByStall(stallId || '', 100) // Fetch all assignments for this stall
  
  // Mutation for assigning operators
  const { mutate: assignOperators, isPending: isAssigning } = useAssignOperatorsMutation()
  
  // Get user data
  const flatUsers = React.useMemo(() => {
    return usersData?.data || []
  }, [usersData])
  
  // Filter users based on search term
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return flatUsers;
    
    const term = searchTerm.toLowerCase();
    return flatUsers.filter((user: User) =>
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }, [flatUsers, searchTerm]);
  
  // Flatten the paginated assignment data
  const flatAssignments = React.useMemo(() => {
    return assignmentsData?.pages.flatMap((page: { data: Assignment[] }) => page.data as Assignment[]) || []
  }, [assignmentsData])
  
  // State to track selected users (user IDs)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  
  // Initialize selected users based on current assignments
  useEffect(() => {
    if (flatAssignments.length > 0) {
      const assignedUserIds = new Set(flatAssignments.map(assignment => assignment.id));
      setSelectedUsers(assignedUserIds);
    }
  }, [flatAssignments]);
  
  // Handle pull to refresh for both users and assignments
  const handleRefresh = async () => {
    await Promise.all([
      refetchUsers(),
      refetchAssignments()
    ]);
  }
  
  // Toggle user selection
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
    
    // Clear the search term when a user is selected
    setSearchTerm('');
  }, [setSearchTerm]);
  
  // Save selected users as operators for this stall
  const handleSaveOperators = () => {
    if (!stallId) return;
    
    // Create assignment data for all selected users
    const assignments = flatUsers
      .filter((user: User) => selectedUsers.has(user.id))
      .map((user: User) => ({
        userId: user.id,
        stallId: stallId,
        userName: user.name,
        stallName: stallData?.name,
        stallType: stallData?.type
      }));
    
    assignOperators(assignments, {
      onSuccess: () => {
        showToast('Operators updated successfully', 'success');
        // Redirect to stall details page after successful save
        if (stallId) {
          navigate(`/admin/stalls/stalldetails/${stallId}`);
        }
      },
      onError: (error: any) => {
        showToast(`Failed to update operators: ${error.message || 'Unknown error'}`, 'error');
      }
    });
  };
  
  // Remove a user from selected operators
  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };
  
  // Render user item with improved selection UI
  const renderUserItem = (user: User, index: number) => {
    const isSelected = selectedUsers.has(user.id);
    const isAssigned = flatAssignments.some(assignment => assignment.id === user.id);
    
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleUserSelection(user.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleUserSelection(user.id);
          }
        }}
        className={`p-4 flex items-center border-b border-gray-100 transition-colors duration-200 ${
          isSelected 
            ? 'bg-indigo-50 border-l-4 border-l-indigo-500' 
            : 'hover:bg-gray-50'
        } ${isAssigned ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
        aria-pressed={isSelected}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-base truncate">{user.name}</h3>
            <div className="flex items-center space-x-2">
              {isAssigned && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Assigned
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm truncate">@{user.username}</p>
          <p className="text-gray-500 text-sm truncate">{user.email}</p>
        </div>
        <div className="ml-4 flex items-center">
          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
            isSelected 
              ? 'bg-indigo-600 border-indigo-600' 
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <svg className="h-4 w-4 text-neutral-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Get selected user objects for displaying as pills
  const selectedUserObjects = React.useMemo(() => {
    return flatUsers.filter((user: User) => selectedUsers.has(user.id));
  }, [flatUsers, selectedUsers]);
  
  // Check if we're still loading initial data
  const isLoading = isLoadingUsers || isLoadingAssignments || isLoadingStall;
  const isError = !!usersError || !!assignmentsError || !!stallError;
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with title and save button */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Assign Operators</h1>
            <button
              onClick={handleSaveOperators}
              disabled={isAssigning}
              className={`font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out flex items-center ${
                isAssigning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-neutral-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
              aria-busy={isAssigning}
            >
              {isAssigning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Operators'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Selected operators section */}
      {selectedUserObjects.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Selected Operators</h2>
            <div className="flex flex-wrap gap-2">
              {selectedUserObjects.map(user => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm"
                >
                  {user.name}
                  <button
                    type="button"
                    className="flex-shrink-0 ml-2 h-5 w-5 rounded-full inline-flex items-center justify-center text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => removeSelectedUser(user.id)}
                    aria-label={`Remove ${user.name} from selected operators`}
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users"
            />
          </div>
        </div>
      </div>
      
      {/* User list section */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-500">
            {searchTerm ? `Search Results (${filteredUsers.length})` : `All Users (${flatUsers.length})`}
          </h2>
        </div>
        <div className="h-full px-0 pb-4 overflow-hidden">
          <SharedList<User>
            data={filteredUsers}
            renderItem={renderUserItem}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            isError={isError}
            isEmpty={filteredUsers.length === 0}
            emptyMessage={searchTerm ? "No users match your search" : "No users found"}
            errorMessage={`Failed to load data: ${usersError?.message || assignmentsError?.message || stallError?.message || 'Unknown error'}`}
            loadingMessage={isLoadingUsers ? "Loading users..." : isLoadingAssignments ? "Loading assignments..." : "Loading..."}
          />
        </div>
      </div>
    </div>
  )
}

export default OperatorsPage