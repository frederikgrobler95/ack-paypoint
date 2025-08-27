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
  
  // Fetch all users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
    isFetchingNextPage: isFetchingNextUsers,
    refetch: refetchUsers
  } = useUsers(20)
  
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
  
  // Flatten the paginated user data
  const flatUsers = React.useMemo(() => {
    return usersData?.pages.flatMap((page: { data: User[] }) => page.data as User[]) || []
  }, [usersData])
  
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
      .filter(user => selectedUsers.has(user.id))
      .map(user => ({
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
  
  // Check if we're still loading initial data
  const isLoading = isLoadingUsers || isLoadingAssignments || isLoadingStall;
  const isError = !!usersError || !!assignmentsError || !!stallError;
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
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
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <span className="font-semibold">Stall ID:</span> {stallId}
        </p>
        <p className="text-blue-800 mt-1">
          Select users below to assign them as operators for this stall.
          Checked users are currently assigned as operators.
        </p>
      </div>
      
      <SharedList<User>
        data={flatUsers}
        renderItem={renderUserItem}
        onRefresh={handleRefresh}
        hasMore={hasNextUsers}
        loadMore={() => fetchNextUsers()}
        isLoading={isLoading || isFetchingNextUsers}
        isError={isError}
        isEmpty={flatUsers.length === 0}
        emptyMessage="No users found"
        errorMessage={`Failed to load data: ${usersError?.message || assignmentsError?.message || stallError?.message || 'Unknown error'}`}
        loadingMessage="Loading users and assignments..."
      />
    </div>
  )
}

export default OperatorsPage