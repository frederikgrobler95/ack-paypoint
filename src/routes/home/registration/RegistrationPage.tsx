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
import { useFlowStore } from '@/shared/stores/flowStore';

// Define types for our dummy data

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  registrationDate: string;
}
// Component for displaying total registrations
const TotalRegistrationsCard: React.FC<{ total: number }> = ({ total }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('totalRegistrations')}</h2>
      <p className="text-3xl font-bold text-blue-600">{total}</p>
    </div>
  );
};

// Component for displaying individual customers
const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <div className="ml-3">
          <p className="text-lg font-bold text-gray-900">{customer.name}</p>
          <p className="text-sm text-gray-500">{customer.phone}</p>
          {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {customer.registrationDate}
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
    phone: registration.customerPhone,
    email: registration.customerEmail,
    registrationDate: registration.createdAt?.toDate().toISOString().split('T')[0] || 'Unknown Date',
  })) || [];
  
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TotalRegistrationsCard total={totalRegistrations} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('recentCustomers')}</h2>
        {customers.length > 0 ? (
          customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
            {t('noRegistrationsYet')}
          </div>
        )}
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Reset the registration flow when starting a new registration
            useFlowStore.getState().resetRegistrationFlow();
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