import { create } from 'zustand';
import { Measurement } from '../types/network';

interface AppState {
  currentMeasurement: Measurement | null;
  isMeasuring: boolean;
  setCurrentMeasurement: (m: Measurement | null) => void;
  setIsMeasuring: (val: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  currentMeasurement: null,
  isMeasuring: false,
  setCurrentMeasurement: (m) => set({ currentMeasurement: m }),
  setIsMeasuring: (val) => set({ isMeasuring: val }),
}));
