export const mockSalesData = {
  totalSales: 125000,
  transactions: [
    { id: 1, type: 'sale', amount: 50000, customer: 'John Doe' },
    { id: 2, type: 'sale', amount: 75000, customer: 'Jane Smith' },
  ],
  qrCode: 'mock-qr-code-sales',
  customerName: 'John Doe',
  amountCents: 50000,
};

export const mockCheckoutData = {
  totalRevenue: 250000,
  payments: [
    { id: 1, amount: 120000, customer: 'Alice Wonderland' },
    { id: 2, amount: 130000, customer: 'Bob Builder' },
  ],
  qrCode: 'mock-qr-code-checkout',
  customerName: 'Alice Wonderland',
  amountCents: 120000,
};

export const mockRefundsData = {
  transactions: [
    { id: 1, type: 'sale', amount: 50000, customer: 'John Doe' },
    { id: 2, type: 'refund', amount: 20000, customer: 'Jane Smith' },
    { id: 3, type: 'sale', amount: 75000, customer: 'Jane Smith' },
  ],
  qrCode: 'mock-qr-code-refunds',
  customerName: 'Jane Smith',
  originalAmountCents: 75000,
  refundAmountCents: 0,
};

export const mockRegistrationData = {
  totalRegistrations: 5,
  registrations: [
    { id: 1, name: 'Charlie Brown', phone: '555-0101' },
    { id: 2, name: 'Diana Prince', phone: '555-0102' },
  ],
  customerName: 'New Customer',
  customerPhone: '555-0103',
  customerEmail: 'new.customer@example.com',
  qrCode: 'mock-qr-code-registration',
};