import { create } from 'zustand';
import { Stall, StallType } from '@/shared/contracts/stall';

// Define the work store state type
interface WorkState {
  currentAssignmentId: string | null;
  currentStallId: string | null;
  currentStall: Stall | null;
  currentStallType: StallType | null;
  scannerTorchOn: boolean;
  setCurrentAssignmentId: (id: string | null) => void;
  setCurrentStallId: (id: string | null) => void;
  setCurrentStall: (stall: Stall | null) => void;
  setCurrentStallType: (type: StallType | null) => void;
  setScannerTorchOn: (on: boolean) => void;
  clearWork: () => void;
}

// Create the work store
export const useWorkStore = create<WorkState>((set) => ({
  currentAssignmentId: null,
  currentStallId: null,
  currentStall: null,
  currentStallType: null,
  scannerTorchOn: false,
  setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),
  setCurrentStallId: (id) => set({ currentStallId: id }),
  setCurrentStall: (stall) => set({ currentStall: stall }),
  setCurrentStallType: (type) => set({ currentStallType: type }),
  setScannerTorchOn: (on) => set({ scannerTorchOn: on }),
  clearWork: () => set({
    currentAssignmentId: null,
    currentStallId: null,
    currentStall: null,
    currentStallType: null,
    scannerTorchOn: false
  }),
}));