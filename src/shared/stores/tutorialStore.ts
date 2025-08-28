import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase';
import { getAuth } from 'firebase/auth';

interface Transaction {
  id: string;
  operatorName: string;
  customerName: string;
  amountCents: number;
  type: 'sale' | 'refund' | 'registration';
  createdAt: any; // Firestore Timestamp
}

interface TutorialState {
  // Current tutorial info
  currentTutorial: 'sales' | 'registration' | 'checkout' | null;
  currentStep: number;
  totalSteps: number;
  
  // Mock data
  mockSalesData: {
    qrCode: string;
    customerName: string;
    amountCents: number;
    transactions: Transaction[];
    totalSales: number;
  };
  
  mockRegistrationData: {
    qrCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    registrations: any[];
    totalRegistrations: number;
  };
  
  mockCheckoutData: {
    qrCode: string;
    customerName: string;
    amountCents: number;
    payments: Transaction[];
    totalRevenue: number;
    items: number;
  };
  
  // Add missing mockData property with proper structure
  mockData: {
    sales: {
      qrCode: string;
      customerName: string;
      amountCents: number;
      transactions: Transaction[];
      totalSales: number;
    };
    registration: {
      qrCode: string;
      customerName: string;
      phone: string; // Changed from customerPhone to phone to match component expectations
      customerEmail: string;
      registrations: any[];
      totalRegistrations: number;
    };
    checkout: {
      qrCode: string;
      customerName: string;
      amountCents: number;
      payments: Transaction[];
      totalRevenue: number;
      items: { name: string }[]; // Changed from number to array to match component expectations
    };
  };
  
  // Tutorial progress
  salesSteps: {
    step1: boolean; // QR scanning
    step2: boolean; // Transaction details
    step3: boolean; // Payment confirmation
  };
  
  registrationSteps: {
    step1: boolean; // Customer details
    step2: boolean; // QR scanning
    step3: boolean; // Registration confirmation
  };
  
  checkoutSteps: {
    step1: boolean; // QR scanning
    step2: boolean; // Payment amount
    step3: boolean; // Payment confirmation
  };
  
  // Tutorial settings
  tutorialEnabled: boolean;
  
  // Methods
  setCurrentTutorial: (tutorial: 'sales' | 'registration' | 'checkout' | null) => void;
  setCurrentStep: (step: number) => void;
  setTutorialEnabled: (enabled: boolean) => void;
  markTutorialAsCompleted: () => void;
  
  
  // Sales tutorial methods
  completeSalesStep: (step: number) => void;
  resetSalesTutorial: () => void;
  
  // Registration tutorial methods
  completeRegistrationStep: (step: number) => void;
  resetRegistrationTutorial: () => void;
  
  // Checkout tutorial methods
  completeCheckoutStep: (step: number) => void;
  resetCheckoutTutorial: () => void;
  
  // Actions to update mock data
  setMockSalesData: (data: Partial<TutorialState['mockSalesData']>) => void;
  setMockRegistrationData: (data: Partial<TutorialState['mockRegistrationData']>) => void;
  setMockCheckoutData: (data: Partial<TutorialState['mockCheckoutData']>) => void;
  
  // Add missing methods
  setTotalSteps: (steps: number) => void;
  onCompleteTutorial: () => void;
  resetCurrentTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      currentTutorial: null,
      currentStep: 0,
      tutorialEnabled: true,
      totalSteps: 0, // Initialize totalSteps
      mockData: {
        sales: {
          qrCode: 'BASAAR25-927382',
          customerName: 'Sarel Seemonster',
          amountCents: 10000, // 100.00 in cents
          transactions: [
            {
              id: '1',
              operatorName: 'Bennie Boekwurm',
              customerName: 'Sarel Seemonster',
              amountCents: 10000,
              type: 'sale',
              createdAt: new Date(),
            },
            {
              id: '2',
              operatorName: 'Bennie Boekwurm',
              customerName: 'Karel Kraai',
              amountCents: 15000,
              type: 'sale',
              createdAt: new Date(),
            },
          ],
          totalSales: 25000, // 250.00 in cents
        },
        registration: {
          qrCode: 'BASAAR25-927382',
          customerName: 'Sarel Seemonster',
          phone: '0821234567', // Changed from customerPhone to phone to match component expectations
          customerEmail: 'sarel@wieliewalie.com',
          registrations: [
            {
              id: '1',
              customerName: 'Sarel Seemonster',
              customerPhone: '0821234567',
              customerEmail: 'sarel@wieliewalie.com',
              qrCode: 'BASAAR25-927382',
              registrationDate: new Date(),
            },
            {
              id: '2',
              customerName: 'Bennie Boekwurm',
              customerPhone: '0839876543',
              customerEmail: 'bennie@wieliewalie.com',
              qrCode: 'BASAAR25-938746',
              registrationDate: new Date(),
            },
          ],
          totalRegistrations: 2,
        },
        checkout: {
          qrCode: 'BASAAR25-927382',
          customerName: 'Sarel Seemonster',
          amountCents: 7500, // 75.00 in cents
          payments: [
            {
              id: '1',
              operatorName: 'Karel Kraai',
              customerName: 'Sarel Seemonster',
              amountCents: 7500,
              type: 'sale',
              createdAt: new Date(),
            },
            {
              id: '2',
              operatorName: 'Karel Kraai',
              customerName: 'Bennie Boekwurm',
              amountCents: 12000,
              type: 'sale',
              createdAt: new Date(),
            },
          ],
          totalRevenue: 19500, // 195.00 in cents
          items: [
            { name: 'Item 1' },
            { name: 'Item 2' },
            { name: 'Item 3' },
            { name: 'Item 4' },
            { name: 'Item 5' }
          ], // Changed from number to array to match component expectations
        }
      },
      mockSalesData: {
        qrCode: 'BASAAR25-927382',
        customerName: 'Sarel Seemonster',
        amountCents: 10000, // 100.00 in cents
        transactions: [
          {
            id: '1',
            operatorName: 'Tutorial Operator',
            customerName: 'John Doe',
            amountCents: 10000,
            type: 'sale',
            createdAt: new Date(),
          },
          {
            id: '2',
            operatorName: 'Tutorial Operator',
            customerName: 'Jane Smith',
            amountCents: 15000,
            type: 'sale',
            createdAt: new Date(),
          },
        ],
        totalSales: 25000, // 250.00 in cents
      },
      mockRegistrationData: {
        qrCode: 'BASAAR25-927382',
        customerName: 'Sarel Seemonster',
        customerPhone: '0821234567',
        customerEmail: 'sarel@wieliewalie',
        registrations: [
          {
            id: '1',
            customerName: 'Bennie Boekwurm',
            customerPhone: '0821234567',
            customerEmail: 'bennie@wieliewalie.com',
            qrCode: 'BASAAR25-923241',
            registrationDate: new Date(),
          },
          {
            id: '2',
            customerName: 'Karel Kraai',
            customerPhone: '0839876543',
            customerEmail: 'karel@wieliewalie.com',
            qrCode: 'BASAAR25-989473',
            registrationDate: new Date(),
          },
        ],
        totalRegistrations: 2,
      },
      mockCheckoutData: {
        qrCode: 'BASAAR25-927382',
        customerName: 'Sarel Seemonster',
        amountCents: 7500, // 75.00 in cents
        payments: [
          {
            id: '1',
            operatorName: 'Bennie Boekwurm',
            customerName: 'Sarel Seemonster',
            amountCents: 7500,
            type: 'sale',
            createdAt: new Date(),
          },
          {
            id: '2',
            operatorName: 'Karel Kraai',
            customerName: 'Bennie Boekwurm',
            amountCents: 12000,
            type: 'sale',
            createdAt: new Date(),
          },
        ],
        totalRevenue: 19500, // 195.00 in cents
        items: 5,
      },
      salesSteps: {
        step1: false,
        step2: false,
        step3: false,
      },
      registrationSteps: {
        step1: false,
        step2: false,
        step3: false,
      },
      checkoutSteps: {
        step1: false,
        step2: false,
        step3: false,
      },
      
      setCurrentTutorial: (tutorial) => {
        // Only update if the tutorial is actually changing
        set((state) => {
          if (state.currentTutorial !== tutorial) {
            return { currentTutorial: tutorial };
          }
          return {};
        });
      },
      setCurrentStep: (step) => {
        // Only update if the step is actually changing
        set((state) => {
          if (state.currentStep !== step) {
            return { currentStep: step };
          }
          return {};
        });
      },
      setTutorialEnabled: (enabled) => {
        // Only update if the enabled state is actually changing
        set((state) => {
          if (state.tutorialEnabled !== enabled) {
            return { tutorialEnabled: enabled };
          }
          return {};
        });
      },
      
      markTutorialAsCompleted: () => {
        // Reset current tutorial state
        get().resetCurrentTutorial();
      },
      
      
      completeSalesStep: (step) => {
        set((state) => {
          const stepKey = `step${step}` as keyof typeof state.salesSteps;
          if (state.salesSteps[stepKey] !== true) {
            return {
              salesSteps: {
                ...state.salesSteps,
                [stepKey]: true,
              },
            };
          }
          return {};
        });
      },
      
      resetSalesTutorial: () => {
        set({
          salesSteps: {
            step1: false,
            step2: false,
            step3: false,
          },
        });
      },
      
      setMockSalesData: (data) => {
        set((state) => ({
          mockSalesData: {
            ...state.mockSalesData,
            ...data,
          },
        }));
      },
      
      completeRegistrationStep: (step) => {
        set((state) => {
          const stepKey = `step${step}` as keyof typeof state.registrationSteps;
          if (state.registrationSteps[stepKey] !== true) {
            return {
              registrationSteps: {
                ...state.registrationSteps,
                [stepKey]: true,
              },
            };
          }
          return {};
        });
      },
      
      resetRegistrationTutorial: () => {
        set({
          registrationSteps: {
            step1: false,
            step2: false,
            step3: false,
          },
        });
      },
      
      setMockRegistrationData: (data) => {
        set((state) => ({
          mockRegistrationData: {
            ...state.mockRegistrationData,
            ...data,
          },
        }));
      },
      
      completeCheckoutStep: (step) => {
        set((state) => {
          const stepKey = `step${step}` as keyof typeof state.checkoutSteps;
          if (state.checkoutSteps[stepKey] !== true) {
            return {
              checkoutSteps: {
                ...state.checkoutSteps,
                [stepKey]: true,
              },
            };
          }
          return {};
        });
      },
      
      resetCheckoutTutorial: () => {
        set({
          checkoutSteps: {
            step1: false,
            step2: false,
            step3: false,
          },
        });
      },
      
      setMockCheckoutData: (data) => {
        set((state) => ({
          mockCheckoutData: {
            ...state.mockCheckoutData,
            ...data,
          },
        }));
      },
      
      // Add implementation for missing methods
      setTotalSteps: (steps) => {
        // Only update if the total steps is actually changing
        set((state) => {
          if (state.totalSteps !== steps) {
            return { totalSteps: steps };
          }
          return {};
        });
      },
      
      onCompleteTutorial: () => {
        // This should be implemented based on the existing markTutorialAsCompleted
        get().markTutorialAsCompleted();
      },
      
      resetTutorial: () => {
        set({
          currentTutorial: null,
          currentStep: 0,
          tutorialEnabled: true,
          salesSteps: {
            step1: false,
            step2: false,
            step3: false,
          },
          registrationSteps: {
            step1: false,
            step2: false,
            step3: false,
          },
          checkoutSteps: {
            step1: false,
            step2: false,
            step3: false,
          },
        });
      },
      
      resetCurrentTutorial: () => {
        set({
          currentTutorial: null,
          currentStep: 0,
        });
      },
    }),
    {
      name: 'tutorial-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        tutorialEnabled: state.tutorialEnabled,
      }), // only persist the completion status and settings, not the current state
    }
  )
);