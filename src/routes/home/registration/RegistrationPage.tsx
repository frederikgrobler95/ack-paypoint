/**
 * Registration Flow - Page Container
 *
 * This file implements the Sales spacing standard via FlowContainer:
 * - Horizontal: px-4 on the outer page container
 * - Vertical: pt-4/pb-4 by default; withNoHeaderOffset/withBottomOffset when needed
 * - Section rhythm: consistent spacing (follows Sales usage)
 * - Respects fixed Header and BottomNavigation components
 *
 * Source of truth: Sales pages implementation
 */
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useRegistrations } from '@/queries/registrations';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { FlowContainer } from '@/shared/ui';
import SharedList from '@/shared/ui/SharedList';
import { useFlowStore } from '@/shared/stores/flowStore';

// Define types for our dummy data
import { Timestamp } from 'firebase/firestore';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  registrationDate: Timestamp | null;
  operatorName: string;
}
// Component for displaying total registrations
const TotalRegistrationsCard: React.FC<{ total: number; onRefresh: () => void }> = ({ total, onRefresh }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('totalRegistrations')}</h2>
          <p className="text-3xl font-bold text-blue-600">{total}</p>
        </div>
        <button
          onClick={onRefresh}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={t('refresh')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Component for displaying individual customers
const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
  // Format the date to show only the time (HH:MM)
  const formattedTime = customer.registrationDate
    ? customer.registrationDate.toDate().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : 'Unknown Time';
  
  // Format the date to show only the date (DD/MM/YYYY)
  const formattedDate = customer.registrationDate
    ? customer.registrationDate.toDate().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    : 'Unknown Date';

  return (
    <div className="bg-white rounded-md shadow-sm p-3 mb-2 grid grid-cols-12 gap-2 items-center">
      <div className="col-span-2 flex justify-start">
        <div className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          Reg
        </div>
      </div>
      <div className="col-span-6 overflow-hidden">
        <p className="text-sm font-bold text-gray-900 truncate">{customer.name}</p>
        <div className="flex items-center text-xs text-gray-500 truncate">
          <span className="truncate">{customer.operatorName}</span>
          <span className="mx-1 flex-shrink-0">•</span>
          <span className="truncate">{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="text-xs text-gray-500 truncate">
            {customer.email}
          </div>
        )}
      </div>
      <div className="col-span-4 flex flex-col items-end">
        <div className="text-xs text-gray-500">{formattedDate}</div>
        <div className="text-xs text-gray-500">{formattedTime}</div>
      </div>
    </div>
  );
};

function RegistrationPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { stall } = useMyAssignment();
  
  const stallName = stall?.name || "Your Stall";
  
  const {
    data: registrationsData,
    isLoading,
    error,
    refetch
  } = useRegistrations(20);
  
  // Flatten the paginated data
  const flatRegistrations = React.useMemo(() => {
    return registrationsData?.pages.flatMap((page: { data: any[] }) => page.data) || [];
  }, [registrationsData]);
  
  // Transform registration data to our Customer interface
  const customers: Customer[] = flatRegistrations?.map((registration: any) => ({
    id: registration.id,
    name: registration.customerName,
    phone: registration.customer?.phone || '',
    email: registration.customer?.email || '',
    registrationDate: registration.createdAt || null,
    operatorName: registration.operatorName || 'Unknown Operator',
  })) || [];
  
  // Sort customers by registration date in descending order
  const sortedCustomers = React.useMemo(() => {
    return [...customers].sort((a, b) => {
      if (!a.registrationDate || !b.registrationDate) return 0;
      const dateA = a.registrationDate.toDate();
      const dateB = b.registrationDate.toDate();
      return dateB.getTime() - dateA.getTime();
    });
  }, [customers]);
  
  const totalRegistrations = flatRegistrations?.length || 0;
  
  // Invalidate queries when component mounts to refetch data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['registrations', 'list', 'all'] });
  }, [queryClient]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingRegistratiomin-h-screenns')}</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <p className="text-gray-700 mb-4">{t('failedToLoadRegistrations')}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-neutral-50 font-semibold py-2 px-4 rounded-md transition duration-300"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TotalRegistrationsCard total={totalRegistrations} onRefresh={refetch} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('recentCustomers')}</h2>
        <SharedList
          data={sortedCustomers}
          renderItem={(customer: Customer) => <CustomerCard customer={customer} />}
          onRefresh={refetch}
          isEmpty={sortedCustomers.length === 0}
          emptyMessage={t('noRegistrationsYet')}
        />
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-neutral-50 font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Reset the registration flow when starting a new registration
            useFlowStore.getState().startFlow();
            navigate('/registration/step1');
          }}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </FlowContainer>
  );
}

export default RegistrationPage;