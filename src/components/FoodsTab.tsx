import { useTranslation } from 'react-i18next';
import { useItems } from '../hooks/useItems';
import ItemList from './ItemList';
import type { Item } from '../types';

interface FoodsTabProps {
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
}

export default function FoodsTab({ onAddItem, onEditItem }: FoodsTabProps) {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useItems('foods');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-violet-500"
          role="status"
        >
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ItemList items={items} onEdit={onEditItem} />
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-2xl font-light shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        onClick={onAddItem}
        aria-label={t('add_item')}
      >
        +
      </button>
    </div>
  );
}
