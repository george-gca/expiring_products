import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { isExpired, isExpiringSoon, toRelative } from '../utils/dateUtils';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
}

export default function ItemCard({ item, onEdit }: ItemCardProps) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  
  // Map app locale to luxon locale
  const luxonLocale = language === 'en-us' ? 'en-US' : 'pt-BR';
  
  const expired = isExpired(item.expiring_date);
  const soon = isExpiringSoon(item.expiring_date);
  
  let className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
  if (expired) className += ' list-group-item-danger';
  else if (soon) className += ' list-group-item-warning';

  return (
    <button
      type="button"
      className={className}
      onClick={() => onEdit(item)}
    >
      <div>
        <div className="fw-bold">{item.name}</div>
        <small>{t('expire_in')}: {toRelative(item.expiring_date, luxonLocale)}</small>
        {item.opened && <span className="badge bg-info ms-2">{t('opened_items')}</span>}
      </div>
      <span className="badge bg-primary rounded-pill">{item.quantity}</span>
    </button>
  );
}
