import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  function toggle() {
    const next = language === 'en-US' ? 'pt-BR' : 'en-US';
    setLanguage(next);
    i18n.changeLanguage(next).catch(console.error);
  }

  return (
    <button
      onClick={toggle}
      className="px-4 py-2 rounded-md text-sm font-medium border border-cyan-500 text-cyan-300 hover:bg-cyan-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      {language === 'en-US' ? 'PT-BR' : 'EN-US'}
    </button>
  );
}
