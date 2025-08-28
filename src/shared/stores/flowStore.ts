import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SalesFlowState {
  qrCode: string | null;
  idempotencyKey: string | null;
  amountCents: number | null;
  // Add other flow-specific data as needed
}

interface FlowState {
  // Sales flow state
  sales: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
  // Store actual flow data
  salesData: SalesFlowState;
  
  // Registration flow state
  registration: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
  
  // Checkout flow state
  checkout: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
  
  // Refunds flow state
  refunds: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };

  // Actions to update flow states
  setSalesStepComplete: (step: number) => void;
  setRegistrationStepComplete: (step: number) => void;
  setCheckoutStepComplete: (step: number) => void;
  setRefundsStepComplete: (step: number) => void;
  
  // Actions to store flow data
  setSalesData: (data: Partial<SalesFlowState>) => void;
  
  // Actions to reset flows
  resetSalesFlow: () => void;
  resetRegistrationFlow: () => void;
  resetCheckoutFlow: () => void;
  resetRefundsFlow: () => void;
  
  // Actions to check if steps are complete
  isSalesStepComplete: (step: number) => boolean;
  isRegistrationStepComplete: (step: number) => boolean;
  isCheckoutStepComplete: (step: number) => boolean;
  isRefundsStepComplete: (step: number) => boolean;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      sales: {
        step1: false,
        step2: false,
        step3: false,
      },
      salesData: {
        qrCode: null,
        idempotencyKey: null,
        amountCents: null,
      },
      registration: {
        step1: false,
        step2: false,
        step3: false,
      },
      checkout: {
        step1: false,
        step2: false,
        step3: false,
      },
      refunds: {
        step1: false,
        step2: false,
        step3: false,
        step4: false,
      },

      setSalesStepComplete: (step) => set((state) => ({
        sales: {
          ...state.sales,
          [`step${step}`]: true,
        }
      })),

      setRegistrationStepComplete: (step) => set((state) => ({
        registration: {
          ...state.registration,
          [`step${step}`]: true,
        }
      })),

      setCheckoutStepComplete: (step) => set((state) => ({
        checkout: {
          ...state.checkout,
          [`step${step}`]: true,
        }
      })),

      setRefundsStepComplete: (step) => set((state) => ({
        refunds: {
          ...state.refunds,
          [`step${step}`]: true,
        }
      })),

      setSalesData: (data) => set((state) => ({
        salesData: {
          ...state.salesData,
          ...data,
        }
      })),

      resetSalesFlow: () => set({
        sales: {
          step1: false,
          step2: false,
          step3: false,
        },
        salesData: {
          qrCode: null,
          idempotencyKey: null,
          amountCents: null,
        }
      }),

      resetRegistrationFlow: () => set({
        registration: {
          step1: false,
          step2: false,
          step3: false,
        }
      }),

      resetCheckoutFlow: () => set({
        checkout: {
          step1: false,
          step2: false,
          step3: false,
        }
      }),

      resetRefundsFlow: () => set({
        refunds: {
          step1: false,
          step2: false,
          step3: false,
          step4: false,
        }
      }),

      isSalesStepComplete: (step) => {
        const state = get();
        return state.sales[`step${step}` as keyof typeof state.sales] || false;
      },

      isRegistrationStepComplete: (step) => {
        const state = get();
        return state.registration[`step${step}` as keyof typeof state.registration] || false;
      },

      isCheckoutStepComplete: (step) => {
        const state = get();
        return state.checkout[`step${step}` as keyof typeof state.checkout] || false;
      },

      isRefundsStepComplete: (step) => {
        const state = get();
        return state.refunds[`step${step}` as keyof typeof state.refunds] || false;
      },
    }),
    {
      name: 'flow-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        sales: state.sales,
        salesData: state.salesData,
        registration: state.registration,
        checkout: state.checkout,
        refunds: state.refunds,
      }), // only persist the flow states, not the actions
    }
  )
);