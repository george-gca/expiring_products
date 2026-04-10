import { useTranslation } from 'react-i18next';

export default function GithubCorner() {
  const { t } = useTranslation();
  return (
    <a
      href="https://github.com/andreriffen/expiring_products"
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted small float-end"
    >
      {t('view_on_github')}
    </a>
  );
}
