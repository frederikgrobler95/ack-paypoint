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
  
  // Tutorial completion status for each flow
  salesTutorialCompleted: boolean;
  checkoutTutorialCompleted: boolean;
  registrationTutorialCompleted: boolean;
  
  // Tutorial settings
  tutorialEnabled: boolean;
  tutorialCompleted: boolean;
  
  // Methods
  setCurrentTutorial: (tutorial: 'sales' | 'registration' | 'checkout' | null) => void;
  setCurrentStep: (step: number) => void;
  setTutorialEnabled: (enabled: boolean) => void;
  setTutorialCompleted: (completed: boolean) => void;
  markTutorialAsCompleted: () => void;
  
  // Actions to mark tutorials as completed
  setSalesTutorialCompleted: (completed: boolean) => void;
  setCheckoutTutorialCompleted: (completed: boolean) => void;
  setRegistrationTutorialCompleted: (completed: boolean) => void;
  
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
      salesTutorialCompleted: false,
      checkoutTutorialCompleted: false,
      registrationTutorialCompleted: false,
      tutorialEnabled: true,
      tutorialCompleted: false,
      totalSteps: 0, // Initialize totalSteps
      mockData: {
        sales: {
          qrCode: 'TUTORIAL_QR_CODE_123',
          customerName: 'John Doe',
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
        registration: {
          qrCode: 'TUTORIAL_REG_QR_456',
          customerName: 'Alice Johnson',
          phone: '0821234567', // Changed from customerPhone to phone to match component expectations
          customerEmail: 'alice.johnson@example.com',
          registrations: [
            {
              id: '1',
              customerName: 'Alice Johnson',
              customerPhone: '0821234567',
              customerEmail: 'alice.johnson@example.com',
              qrCode: 'TUTORIAL_REG_QR_456',
              registrationDate: new Date(),
            },
            {
              id: '2',
              customerName: 'Bob Smith',
              customerPhone: '0839876543',
              customerEmail: 'bob.smith@example.com',
              qrCode: 'TUTORIAL_REG_QR_789',
              registrationDate: new Date(),
            },
          ],
          totalRegistrations: 2,
        },
        checkout: {
          qrCode: 'TUTORIAL_CHECKOUT_QR_789',
          customerName: 'Michael Brown',
          amountCents: 7500, // 75.00 in cents
          payments: [
            {
              id: '1',
              operatorName: 'Tutorial Operator',
              customerName: 'Michael Brown',
              amountCents: 7500,
              type: 'sale',
              createdAt: new Date(),
            },
            {
              id: '2',
              operatorName: 'Tutorial Operator',
              customerName: 'Sarah Wilson',
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
        qrCode: 'TUTORIAL_QR_CODE_123',
        customerName: 'John Doe',
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
        qrCode: 'TUTORIAL_REG_QR_456',
        customerName: 'Alice Johnson',
        customerPhone: '0821234567',
        customerEmail: 'alice.johnson@example.com',
        registrations: [
          {
            id: '1',
            customerName: 'Alice Johnson',
            customerPhone: '0821234567',
            customerEmail: 'alice.johnson@example.com',
            qrCode: 'TUTORIAL_REG_QR_456',
            registrationDate: new Date(),
          },
          {
            id: '2',
            customerName: 'Bob Smith',
            customerPhone: '0839876543',
            customerEmail: 'bob.smith@example.com',
            qrCode: 'TUTORIAL_REG_QR_789',
            registrationDate: new Date(),
          },
        ],
        totalRegistrations: 2,
      },
      mockCheckoutData: {
        qrCode: 'TUTORIAL_CHECKOUT_QR_789',
        customerName: 'Michael Brown',
        amountCents: 7500, // 75.00 in cents
        payments: [
          {
            id: '1',
            operatorName: 'Tutorial Operator',
            customerName: 'Michael Brown',
            amountCents: 7500,
            type: 'sale',
            createdAt: new Date(),
          },
          {
            id: '2',
            operatorName: 'Tutorial Operator',
            customerName: 'Sarah Wilson',
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
      
      setCurrentTutorial: (tutorial) => set({ currentTutorial: tutorial }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setTutorialEnabled: (enabled) => set({ tutorialEnabled: enabled }),
      setTutorialCompleted: (completed) => set({ tutorialCompleted: completed }),
      
      markTutorialAsCompleted: () => {
        // Mark tutorial as completed in the store
        set({
          tutorialCompleted: true,
          tutorialEnabled: false
        });
        
        // Check if all tutorials are completed
        const state = get();
        if (state.salesTutorialCompleted && state.checkoutTutorialCompleted && state.registrationTutorialCompleted) {
          // Update Firestore
          const auth = getAuth(app);
          const user = auth.currentUser;
          if (user) {
            const firestore = getFirestore(app);
            const userDocRef = doc(firestore, 'users', user.uid);
            updateDoc(userDocRef, {
              tutorialCompleted: true,
              tutorialEnabled: false
            }).catch((error) => {
              console.error('Error updating tutorial completed status in Firestore:', error);
            });
          }
        }
        
        // Reset current tutorial state
        get().resetCurrentTutorial();
      },
      
      setSalesTutorialCompleted: (completed) => {
        set({ salesTutorialCompleted: completed });
        // Update Firestore
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
          const firestore = getFirestore(app);
          const userDocRef = doc(firestore, 'users', user.uid);
          updateDoc(userDocRef, {
            salesTutorialCompleted: completed
          }).catch((error) => {
            console.error('Error updating sales tutorial completed status in Firestore:', error);
          });
        }
      },
      setCheckoutTutorialCompleted: (completed) => {
        set({ checkoutTutorialCompleted: completed });
        // Update Firestore
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
          const firestore = getFirestore(app);
          const userDocRef = doc(firestore, 'users', user.uid);
          updateDoc(userDocRef, {
            checkoutTutorialCompleted: completed
          }).catch((error) => {
            console.error('Error updating checkout tutorial completed status in Firestore:', error);
          });
        }
      },
      setRegistrationTutorialCompleted: (completed) => {
        set({ registrationTutorialCompleted: completed });
        // Update Firestore
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
          const firestore = getFirestore(app);
          const userDocRef = doc(firestore, 'users', user.uid);
          updateDoc(userDocRef, {
            registrationTutorialCompleted: completed
          }).catch((error) => {
            console.error('Error updating registration tutorial completed status in Firestore:', error);
          });
        }
      },
      
      completeSalesStep: (step) => {
        set((state) => ({
          salesSteps: {
            ...state.salesSteps,
            [`step${step}`]: true,
          },
        }));
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
      
      setMockSalesData: (data) => set((state) => ({
        mockSalesData: {
          ...state.mockSalesData,
          ...data,
        },
      })),
      
      completeRegistrationStep: (step) => {
        set((state) => ({
          registrationSteps: {
            ...state.registrationSteps,
            [`step${step}`]: true,
          },
        }));
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
      
      setMockRegistrationData: (data) => set((state) => ({
        mockRegistrationData: {
          ...state.mockRegistrationData,
          ...data,
        },
      })),
      
      completeCheckoutStep: (step) => {
        set((state) => ({
          checkoutSteps: {
            ...state.checkoutSteps,
            [`step${step}`]: true,
          },
        }));
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
      
      setMockCheckoutData: (data) => set((state) => ({
        mockCheckoutData: {
          ...state.mockCheckoutData,
          ...data,
        },
      })),
      
      // Add implementation for missing methods
      setTotalSteps: (steps) => set({ totalSteps: steps }),
      
      onCompleteTutorial: () => {
        // This should be implemented based on the existing markTutorialAsCompleted
        get().markTutorialAsCompleted();
      },
      
      resetTutorial: () => set({
        currentTutorial: null,
        currentStep: 0,
        salesTutorialCompleted: false,
        checkoutTutorialCompleted: false,
        registrationTutorialCompleted: false,
        tutorialEnabled: true,
        tutorialCompleted: false,
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
      }),
      
      resetCurrentTutorial: () => set({
        currentTutorial: null,
        currentStep: 0,
      }),
    }),
    {
      name: 'tutorial-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        salesTutorialCompleted: state.salesTutorialCompleted,
        checkoutTutorialCompleted: state.checkoutTutorialCompleted,
        registrationTutorialCompleted: state.registrationTutorialCompleted,
        tutorialEnabled: state.tutorialEnabled,
        tutorialCompleted: state.tutorialCompleted,
      }), // only persist the completion status and settings, not the current state
    }
  )
);