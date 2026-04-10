import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en-us' | 'pt-br';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt-br',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'expiring-products-settings' }
  )
);
