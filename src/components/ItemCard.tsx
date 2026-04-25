import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { isExpired, isExpiringSoon, toRelative, appLocaleToLuxonLocale } from '../utils/dateUtils';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
}

export default function ItemCard({ item, onEdit }: ItemCardProps) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const luxonLocale = appLocaleToLuxonLocale(language);

  const expired = isExpired(item.expiring_date);
  const soon = isExpiringSoon(item.expiring_date);

  const baseClasses =
    'w-full flex justify-between items-center px-4 py-3 text-left transition-colors cursor-pointer border-l-4';
  const stateClasses = expired
    ? 'bg-red-900/30 border-red-500 hover:bg-red-900/50'
    : soon
      ? 'bg-amber-900/30 border-amber-500 hover:bg-amber-900/50'
      : 'bg-slate-800 border-transparent hover:bg-slate-700';

  return (
    <button type="button" className={`${baseClasses} ${stateClasses}`} onClick={() => onEdit(item)}>
      <div>
        <div className="font-semibold text-slate-100">{item.name}</div>
        <div className="text-sm text-slate-400">
          {t('expire_in')}: {toRelative(item.expiring_date, luxonLocale)}
        </div>
        {item.opened && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-cyan-700 text-cyan-100 text-xs font-medium">
            {t('opened_items')}
          </span>
        )}
      </div>
      <span className="ml-4 shrink-0 px-2.5 py-1 rounded-full bg-violet-700 text-white text-sm font-semibold">
        {item.quantity}
      </span>
    </button>
  );
}
