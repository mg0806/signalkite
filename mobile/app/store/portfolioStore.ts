import { create } from "zustand";

type PortfolioState = {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  selectedSymbol: "RELIANCE",
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol })
}));
