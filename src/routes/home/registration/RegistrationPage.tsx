import React from 'react'

// Define types for our dummy data
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  registrationDate: string;
}

// Dummy data
const stallName = "Market Street Cafe";
const totalRegistrations = 42;

const customers: Customer[] = [
  { id: '1', name: 'John Smith', phone: '072 123 4567', email: 'john@example.com', registrationDate: '2025-08-25' },
  { id: '2', name: 'Sarah Johnson', phone: '083 456 7890', registrationDate: '2025-08-25' },
  { id: '3', name: 'Mike Williams', phone: '079 876 5432', email: 'mike.w@example.com', registrationDate: '2025-08-24' },
  { id: '4', name: 'Emily Davis', phone: '084 555 6666', registrationDate: '2025-08-24' },
  { id: '5', name: 'Robert Brown', phone: '071 222 3333', email: 'rob.brown@example.com', registrationDate: '2025-08-23' },
];

// Component for displaying total registrations
const TotalRegistrationsCard: React.FC<{ total: number }> = ({ total }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Registrations</h2>
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
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{stallName} Registrations</h1>
      <TotalRegistrationsCard total={totalRegistrations} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Customers</h2>
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Navigation to registration flow would go here
            console.log('Initiate registration flow');
          }}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

export default RegistrationPage;