import { useTranslation } from 'react-i18next';
import ItemCard from './ItemCard';
import { sortItems } from '../utils/sortUtils';
import type { Item } from '../types';

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
}

export default function ItemList({ items, onEdit }: ItemListProps) {
  const { t } = useTranslation();
  const sorted = sortItems(items);

  if (sorted.length === 0) {
    return <p className="text-slate-400 text-center py-8">{t('no_items')}</p>;
  }

  return (
    <div className="divide-y divide-slate-700 rounded-lg overflow-hidden border border-slate-700">
      {sorted.map((item) => (
        <ItemCard key={item.id} item={item} onEdit={onEdit} />
      ))}
    </div>
  );
}
