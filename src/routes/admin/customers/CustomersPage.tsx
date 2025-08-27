import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../../queries/customers'
import { Customer } from '../../../shared/contracts/customer'
import { SharedList } from '../../../shared/ui'

function CustomersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const {
    data: customersData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useCustomers()

  const customers = React.useMemo(() => {
    return customersData?.pages.flatMap((page) => page.data) || []
  }, [customersData])

  // Handle pull to refresh
  const handleRefresh = async () => {
    await refetch()
  }

  // Render customer item
  const renderCustomerItem = (customer: Customer) => (
    <div
      key={customer.id}
      className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      onClick={() => navigate(`/admin/customers/${customer.id}`)}
    >
      <p className="font-semibold text-gray-900">{customer.name}</p>
      <p className="text-sm text-gray-600">{customer.phoneE164}</p>
    </div>
  )

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <button
            onClick={() => navigate('/admin/customers/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
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