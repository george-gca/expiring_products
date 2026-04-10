import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUs from './locales/en-us.json';
import ptBr from './locales/pt-br.json';
import { useSettingsStore } from '../store/settingsStore';

const language = useSettingsStore.getState().language;

i18n.use(initReactI18next).init({
  resources: {
    'en-us': { translation: enUs },
    'pt-br': { translation: ptBr },
  },
  lng: language,
  fallbackLng: 'pt-br',
  interpolation: { escapeValue: false },
});

export default i18n;
