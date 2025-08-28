import React from 'react';
import { useLiveStats } from '@/queries/stats';
import { SharedList } from '@/shared/ui';

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
  // Fetch stats data for the dashboard
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats
  } = useLiveStats();

  // Format currency
  const formatCurrency = (cents: number): string => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await refetchStats();
  };

  // Check if we're still loading initial data
  const isLoading = isStatsLoading;
  
  // Check if we have any errors
  const hasError = statsError;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 p-4 overflow-hidden">
        <SharedList
          data={[{}]} // Dummy data to enable pull-to-refresh
          renderItem={() => (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <StatCard
                  title="Total Sales"
                  value={statsData ? formatCurrency(statsData.totalSales) : 'Loading...'}
                />
                <StatCard
                  title="Total Revenue"
                  value={statsData ? formatCurrency(statsData.totalRevenue) : 'Loading...'}
                />
                <StatCard
                  title="Customers Registered"
                  value={statsData ? statsData.totalCustomersRegistered : 'Loading...'}
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
                      {statsError?.message}
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
    </div>
  );
}

export default DashboardPage;