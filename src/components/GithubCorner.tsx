import { useTranslation } from 'react-i18next';

export default function GithubCorner() {
  const { t } = useTranslation();
  return (
    <a
      href="https://github.com/andreriffen/expiring_products"
      target="_blank"
      rel="noopener noreferrer"
      className="float-right text-sm text-slate-500 hover:text-slate-300 transition-colors"
    >
      {t('view_on_github')}
    </a>
  );
}
