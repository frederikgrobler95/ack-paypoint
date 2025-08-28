import { create } from 'zustand';

interface FlowState {
  flowData: Record<string, any>;
  setFlowData: (data: Record<string, any>) => void;
  startFlow: (initialData?: Record<string, any>) => void;
  clearFlow: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  flowData: {},
  setFlowData: (data) =>
    set((state) => ({
      flowData: {
        ...state.flowData,
        ...data,
      },
    })),
  startFlow: (initialData = {}) =>
    set({
      flowData: initialData,
    }),
  clearFlow: () =>
    set({
      flowData: {},
    }),
}));