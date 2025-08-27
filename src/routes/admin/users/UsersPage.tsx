import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '@/queries/users'
import { SharedList } from '@/shared/ui'
import { User } from '@/shared/contracts/user'

function UsersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const {
    data: usersData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useUsers(20)
  
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
      className="p-4 cursor-pointer"
      onClick={() => navigate(`/admin/users/role/${user.id}`)}
    >
      <div className="flex justify-between items-center">
        <div>
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
    </div>
  )
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          onClick={() => navigate('/admin/users/add')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Add Users
        </button>
      </div>
      
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
  )
}

export default UsersPage