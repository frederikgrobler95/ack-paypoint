import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../../queries/customers'
import { Customer } from '../../../shared/contracts/customer'
import { SharedList } from '../../../shared/ui'
import { useAdminVoidCustomerQrMutation } from '../../../mutations/useAdminVoidCustomerQrMutation'
import { useAdminCreateCustomersReportMutation } from '../../../mutations/useAdminCreateCustomersReportMutation'
import Button from '../../../shared/ui/Button'
import ExportCustomersModal from './ExportCustomersModal'

function CustomersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'clean' | 'paid' | 'unpaid'>('all')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const {
    data: customersData,
    isLoading,
    error,
    refetch
  } = useCustomers(searchTerm)
  const { mutate: voidCustomerQr } = useAdminVoidCustomerQrMutation()
  const { mutate: generateReport, isPending: isGeneratingReport } = useAdminCreateCustomersReportMutation()
  const customers = React.useMemo(() => {
    const allCustomers = customersData?.data || []
    if (filter === 'all') return allCustomers
    return allCustomers.filter(customer => customer.Account.status === filter)
  }, [customersData, filter])

  // Handle export report
  const handleExportReport = (filter: 'all' | 'paid' | 'unpaid') => {
    setIsExportModalOpen(false);
    
    generateReport(
      { filter },
      {
        onSuccess: (data) => {
          // Create a downloadable PDF file
          const byteCharacters = atob(data.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `customers-report-${filter}-${new Date().toISOString().slice(0, 10)}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        onError: (error) => {
          console.error('Error generating report:', error);
          alert('Failed to generate report. Please try again.');
        }
      }
    );
  };

  // Handle pull to refresh
  const handleRefresh = async () => {
    await refetch()
  }

  // Customer Item Component
  const CustomerItem = ({ customer }: { customer: Customer }) => {
    const navigate = useNavigate();
    const { mutate: voidCustomerQr } = useAdminVoidCustomerQrMutation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Format account balance from cents to currency
    const formatBalance = (cents: number) => {
      return `R${(cents / 100).toFixed(2)}`;
    };
    
    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    // Handle void QR code
    const handleVoidQrCode = () => {
      if (window.confirm(`Are you sure you want to void the QR code for ${customer.name}?`)) {
        if (customer.qrCodeId) {
          voidCustomerQr({ qrCodeId: customer.qrCodeId });
        } else {
          alert('Customer does not have a QR code assigned.');
        }
      }
      setIsMenuOpen(false);
    };
    
    // Handle reissue QR code
    const handleReissueQrCode = () => {
      navigate(`/admin/customers/${customer.id}/reissue-qr`);
      setIsMenuOpen(false);
    };
    
    return (
      <div className="p-2 hover:bg-gray-50 transition-colors duration-150">
        <div className="flex justify-between items-center">
          <div className="flex-1" onClick={() => navigate(`/admin/customers/customerdetails/${customer.id}`)}>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{customer.name}</p>
                <p className="text-gray-500 text-xs truncate">{customer.phoneE164}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              customer.Account.status === 'paid' ? 'bg-green-100 text-green-800' :
              customer.Account.status === 'unpaid' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {customer.Account.status}
            </span>
            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                aria-label="Customer options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoidQrCode();
                    }}
                    className="w-full justify-start px-3 py-1.5 text-left text-sm"
                  >
                    Void QR Code
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReissueQrCode();
                    }}
                    className="w-full justify-start px-3 py-1.5 text-left text-sm"
                  >
                    Reissue QR Code
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render customer item
  const renderCustomerItem = (customer: Customer, index: number) => {
    return <CustomerItem key={customer.id} customer={customer} />;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Customers</h1>
          <p className="text-gray-500 text-sm">Manage customer accounts and QR codes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
          <div className="w-full sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
            <button
              onClick={() => navigate('/admin/customers/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Customer
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('clean')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === 'clean'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Clean
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === 'paid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === 'unpaid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList<Customer>
          data={customers}
          renderItem={renderCustomerItem}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          isError={!!error}
          isEmpty={customers.length === 0}
          emptyMessage="No customers found"
          errorMessage={error?.message || "Failed to load customers"}
          loadingMessage="Loading customers..."
        />
      </div>
      
      <ExportCustomersModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onFilterSelect={handleExportReport}
        isGeneratingReport={isGeneratingReport}
      />
    </div>
  )
}

export default CustomersPage