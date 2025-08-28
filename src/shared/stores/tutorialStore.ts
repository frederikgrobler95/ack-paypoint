import { create } from 'zustand';
import {
  mockSalesData,
  mockCheckoutData,
  mockRefundsData,
  mockRegistrationData,
} from './mock';

// Define a generic structure for mock data
interface MockData {
  [key: string]: any;
}

interface TutorialState {
  // Tutorial Step Completion
  sales: { step1: boolean; step2: boolean; step3: boolean };
  checkout: { step1: boolean; step2: boolean; step3: boolean };
  refunds: { step1: boolean; step2: boolean; step3: boolean };
  registration: { step1: boolean; step2: boolean; step3: boolean };

  // Mock Data for Tutorials
  mockSalesData: MockData;
  mockCheckoutData: MockData;
  mockRefundsData: MockData;
  mockRegistrationData: MockData;
  mockData: MockData; // For generic QR scanner

  // Current Tutorial State
  currentTutorial: string | null;
  currentStep: number;
  completedTutorials: string[];
  totalSteps: number;

  // Actions
  setTotalSteps: (steps: number) => void;
  onCompleteTutorial: () => void;
  setSalesStepComplete: (step: number) => void;
  setCheckoutStepComplete: (step: number) => void;
  setRefundsStepComplete: (step: number) => void;
  setRegistrationStepComplete: (step: number) => void;

  resetSalesTutorial: () => void;
  resetCheckoutTutorial: () => void;
  resetRefundsTutorial: () => void;
  resetRegistrationTutorial: () => void;

  setCurrentTutorial: (tutorial: string | null) => void;
  setCurrentStep: (step: number) => void;
  markTutorialAsCompleted: (tutorial: string) => void;
}

const initialTutorialState = {
  sales: { step1: false, step2: false, step3: false },
  checkout: { step1: false, step2: false, step3: false },
  refunds: { step1: false, step2: false, step3: false },
  registration: { step1: false, step2: false, step3: false },
};

export const useTutorialStore = create<TutorialState>((set) => ({
  ...initialTutorialState,
  mockSalesData,
  mockCheckoutData,
  mockRefundsData,
  mockRegistrationData,
  mockData: {},
  currentTutorial: null,
  currentStep: 0,
  completedTutorials: [],
  totalSteps: 0,

  setSalesStepComplete: (step) =>
    set((state) => ({
      sales: { ...state.sales, [`step${step}`]: true },
    })),

  setCheckoutStepComplete: (step) =>
    set((state) => ({
      checkout: { ...state.checkout, [`step${step}`]: true },
    })),

  setRefundsStepComplete: (step) =>
    set((state) => ({
      refunds: { ...state.refunds, [`step${step}`]: true },
    })),

  setRegistrationStepComplete: (step) =>
    set((state) => ({
      registration: { ...state.registration, [`step${step}`]: true },
    })),

  resetSalesTutorial: () => set({ sales: initialTutorialState.sales }),
  resetCheckoutTutorial: () => set({ checkout: initialTutorialState.checkout }),
  resetRefundsTutorial: () => set({ refunds: initialTutorialState.refunds }),
  resetRegistrationTutorial: () => set({ registration: initialTutorialState.registration }),

  setCurrentTutorial: (tutorial) => set({ currentTutorial: tutorial, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setTotalSteps: (steps) => set({ totalSteps: steps }),
  markTutorialAsCompleted: (tutorial) =>
    set((state) => ({
      completedTutorials: [...state.completedTutorials, tutorial],
    })),
  onCompleteTutorial: () => set({ currentTutorial: null, currentStep: 0 }),
}));