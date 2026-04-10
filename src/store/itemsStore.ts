import { create } from 'zustand';

interface ItemsState {
  revalidateKey: number;
  bump: () => void;
}

export const useItemsStore = create<ItemsState>((set) => ({
  revalidateKey: 0,
  bump: () => set((s) => ({ revalidateKey: s.revalidateKey + 1 })),
}));
