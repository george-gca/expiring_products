import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en-US' | 'pt-BR';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'expiring-products-settings' }
  )
);
