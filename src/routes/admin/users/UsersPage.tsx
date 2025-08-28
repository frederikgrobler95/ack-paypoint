import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '@/queries/users'
import { useAdminUpdateUserRoleMutation } from '@/mutations/useAdminUpdateUserRoleMutation'
import { useAdminResetUserTutorialMutation } from '@/mutations/useAdminResetUserTutorialMutation'
import { SharedList } from '@/shared/ui'
import { User } from '@/shared/contracts/user'

function UsersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const {
    data: usersData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useUsers(20, searchTerm)
  
  const updateUserRoleMutation = useAdminUpdateUserRoleMutation()
  const resetUserTutorialMutation = useAdminResetUserTutorialMutation()
  
  // Flatten the paginated data
  const flatUsers = React.useMemo(() => {
    return usersData?.pages.flatMap((page: { data: User[] }) => page.data as User[]) || []
  }, [usersData])
  
  // Handle pull to refresh
  const handleRefresh = async () => {
    await refetch()
  }
  
  // Render user item
  const renderUserItem = (user: User, index: number) => (
    <div
      className="p-4"
    >
      <div
        className="cursor-pointer"
        onClick={() => navigate(`/admin/users/role/${user.id}`)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-[#1A202C] text-base leading-6">{user.name}</h3>
            <p className="text-[#4A5568] text-sm leading-5">@{user.username}</p>
            <p className="text-[#4A5568] text-sm leading-5">{user.email}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium mb-1 ${
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            {user.tutorialEnabled !== undefined && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.tutorialEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.tutorialEnabled ? 'Tutorial On' : 'Tutorial Off'}
              </span>
            )}
          </div>
        </div>
      </div>
      {user.tutorialEnabled !== undefined && (
        <div className="mt-2 flex justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateUserRoleMutation.mutate({
                userId: user.id,
                role: user.role,
                tutorialEnabled: !user.tutorialEnabled
              });
            }}
            className={`px-3 py-1 rounded text-xs font-medium ${
              user.tutorialEnabled
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {user.tutorialEnabled ? 'Disable Tutorial' : 'Enable Tutorial'}
          </button>
          
          {user.tutorialCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUserTutorialMutation.mutate({
                  userId: user.id
                });
              }}
              className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              Reset Tutorial
            </button>
          )}
        </div>
      )}
    </div>
  )
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="flex gap-1 justify-between items-center mb-6">
          <div className="w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/admin/users/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-3 px-3 rounded-md transition duration-300 ease-in-out">
            Add Users
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList<User>
          data={flatUsers}
          renderItem={renderUserItem}
          onRefresh={handleRefresh}
          hasMore={hasNextPage}
          loadMore={() => fetchNextPage()}
          isLoading={isLoading || isFetchingNextPage}
          isError={!!error}
          isEmpty={flatUsers.length === 0}
          emptyMessage="No users found"
          errorMessage={`Failed to load users: ${(error as Error)?.message || 'Unknown error'}`}
          loadingMessage="Loading users..."
        />
      </div>
    </div>
  )
}

export default UsersPage