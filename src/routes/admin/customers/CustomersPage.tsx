import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../../queries/customers'
import { Customer } from '../../../shared/contracts/customer'
import { SharedList } from '../../../shared/ui'

function CustomersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const {
    data: customersData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useCustomers(20, searchTerm)

  const customers = React.useMemo(() => {
    return customersData?.pages.flatMap((page) => page.data) || []
  }, [customersData])

  // Handle pull to refresh
  const handleRefresh = async () => {
    await refetch()
  }

  // Render customer item
  const renderCustomerItem = (customer: Customer, index: number) => (
    <div
      className="p-4 cursor-pointer"
      onClick={() => navigate(`/admin/customers/${customer.id}`)}
    >
      <p className="font-semibold text-[#1A202C] text-base leading-6">{customer.name}</p>
      <p className="text-[#4A5568] text-sm leading-5">{customer.phoneE164}</p>
    </div>
  )

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6 gap-2">
          <div className="w-64">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/admin/customers/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1 px-2 rounded-md transition duration-300 ease-in-out"
          >
            Create New Customer
          </button>
        </div>
        
        <SharedList<Customer>
          data={customers}
          renderItem={renderCustomerItem}
          onRefresh={handleRefresh}
          hasMore={hasNextPage}
          loadMore={() => fetchNextPage()}
          isLoading={isLoading || isFetchingNextPage}
          isError={!!error}
          isEmpty={customers.length === 0}
          emptyMessage="No customers found"
          errorMessage={error?.message || "Failed to load customers"}
          loadingMessage="Loading customers..."
        />
      </div>
    </>
  )
}

export default CustomersPage