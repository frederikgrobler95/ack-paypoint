import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  
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
      },
      onError: (error: any) => {
        showToast(`Failed to update operators: ${error.message || 'Unknown error'}`, 'error');
      }
    });
  };
  
  // Render user item with checkbox
  const renderUserItem = (user: User, index: number) => {
    const isSelected = selectedUsers.has(user.id);
    
    return (
      <div
        className="p-4 flex items-center"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleUserSelection(user.id)}
          className="h-5 w-5 text-[#007BFF] rounded border-[#E2E8F0] focus:ring-[#007BFF]"
        />
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-[#1A202C] text-base leading-6">{user.name}</h3>
          <p className="text-[#4A5568] text-sm leading-5">@{user.username}</p>
          <p className="text-[#4A5568] text-sm leading-5">{user.email}</p>
        </div>
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
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
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <button
            onClick={handleSaveOperators}
            disabled={isAssigning}
            className={`font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out ${
              isAssigning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAssigning ? 'Saving...' : 'Save Operators'}
          </button>
        </div>
        
        {/* Selected operators as pills */}
        {selectedUserObjects.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedUserObjects.map(user => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {user.name}
                  <button
                    type="button"
                    className="flex-shrink-0 ml-2 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none"
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList<User>
          data={filteredUsers}
          renderItem={renderUserItem}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          isError={isError}
          isEmpty={filteredUsers.length === 0}
          emptyMessage="No users found"
          errorMessage={`Failed to load data: ${usersError?.message || assignmentsError?.message || stallError?.message || 'Unknown error'}`}
          loadingMessage="Loading users and assignments..."
        />
      </div>
    </div>
  )
}

export default OperatorsPage