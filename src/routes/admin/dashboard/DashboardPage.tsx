import React from 'react';
import { useLiveStats } from '@/queries/stats';
import { SharedList } from '@/shared/ui';

// Define types for our KPI cards
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}
      </div>
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
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-gray-500 text-sm">Welcome to your admin dashboard</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <StatCard
                  title="Total Sales"
                  value={statsData ? formatCurrency(statsData.totalSales) : 'Loading...'}
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  trend="up"
                  trendValue="12.5%"
                />
                <StatCard
                  title="Total Revenue"
                  value={statsData ? formatCurrency(statsData.totalRevenue) : 'Loading...'}
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  trend="up"
                  trendValue="8.2%"
                />
                <StatCard
                  title="Customers Registered"
                  value={statsData ? statsData.totalCustomersRegistered : 'Loading...'}
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  trend="down"
                  trendValue="3.1%"
                />
              </div>
              
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                  </div>
                </div>
              )}
              
              {hasError && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center p-5 bg-red-50 rounded-lg max-w-md">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-800 mb-1">Failed to load dashboard data</h3>
                    <p className="text-red-600 text-sm">
                      {statsError?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                    >
                      Try Again
                    </button>
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