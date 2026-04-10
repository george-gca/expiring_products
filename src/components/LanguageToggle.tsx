import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  function toggle() {
    const next = language === 'en-us' ? 'pt-br' : 'en-us';
    setLanguage(next);
    i18n.changeLanguage(next).catch(console.error);
  }

  return (
    <button className="btn btn-outline-info" onClick={toggle}>
      {language === 'en-us' ? 'PT-BR' : 'EN-US'}
    </button>
  );
}
