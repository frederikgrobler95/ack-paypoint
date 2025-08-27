import React from 'react';
import { useSaleTransactions } from '@/queries/transactions';
import { useCustomers } from '@/queries/customers';
import { useStalls } from '@/queries/stalls';
import { SharedList } from '@/shared/ui';
import { calculateTotalSales, calculateTotalCheckouts, calculateCustomersRegistered, findTopPerformingStall } from './dashboardUtils';

// Define types for our KPI cards
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

function DashboardPage(): React.JSX.Element {
  // Fetch all data needed for the dashboard
  const {
    data: saleTransactionsData,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useSaleTransactions();

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    error: customersError,
    refetch: refetchCustomers
  } = useCustomers(50); // Fetch a reasonable number of customers

  const {
    data: stallsData,
    isLoading: isStallsLoading,
    error: stallsError,
    refetch: refetchStalls
  } = useStalls(50); // Fetch a reasonable number of stalls

  // Flatten paginated data
  const saleTransactions = React.useMemo(() => {
    return saleTransactionsData || [];
  }, [saleTransactionsData]);

  const customers = React.useMemo(() => {
    if (!customersData?.pages) return [];
    return customersData.pages.flatMap(page => page.data);
  }, [customersData]);

  const stalls = React.useMemo(() => {
    if (!stallsData?.pages) return [];
    return stallsData.pages.flatMap(page => page.data);
  }, [stallsData]);

  // Calculate KPIs
  const totalSalesCents = React.useMemo(() => {
    return calculateTotalSales(saleTransactions);
  }, [saleTransactions]);

  const totalCheckouts = React.useMemo(() => {
    return calculateTotalCheckouts(saleTransactions);
  }, [saleTransactions]);

  const customersRegistered = React.useMemo(() => {
    return calculateCustomersRegistered(customers);
  }, [customers]);

  const topPerformingStall = React.useMemo(() => {
    return findTopPerformingStall(saleTransactions, stalls);
  }, [saleTransactions, stalls]);

  // Format currency
  const formatCurrency = (cents: number): string => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await Promise.all([
      refetchTransactions(),
      refetchCustomers(),
      refetchStalls()
    ]);
  };

  // Check if we're still loading initial data
  const isLoading = isTransactionsLoading || isCustomersLoading || isStallsLoading;
  
  // Check if we have any errors
  const hasError = transactionsError || customersError || stallsError;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      <SharedList
        data={[{}]} // Dummy data to enable pull-to-refresh
        renderItem={() => (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <StatCard
                title="Total Sales"
                value={formatCurrency(totalSalesCents)}
              />
              <StatCard
                title="Total Checkouts"
                value={totalCheckouts}
              />
              <StatCard
                title="Customers Registered"
                value={customersRegistered}
              />
              <StatCard
                title="Top Performing Stall"
                value={topPerformingStall.stall?.name || 'N/A'}
                subtitle={topPerformingStall.stall ? formatCurrency(topPerformingStall.salesCents) : ''}
              />
            </div>
            
            {isLoading && (
              <div className="flex justify-center items-center h-32">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                  <p className="text-gray-600">Loading dashboard data...</p>
                </div>
              </div>
            )}
            
            {hasError && (
              <div className="flex justify-center items-center h-32">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600 font-medium">Failed to load dashboard data</p>
                  <p className="text-red-500 text-sm mt-1">
                    {transactionsError?.message || customersError?.message || stallsError?.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        onRefresh={handleRefresh}
        isLoading={false}
        isError={false}
        isEmpty={false}
      />
    </div>
  );
}

export default DashboardPage;