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

  if (isLoading) return <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>;

  return (
    <div>
      <ItemList items={items} onEdit={onEditItem} />
      <button
        className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4"
        style={{ width: 56, height: 56, fontSize: '1.5rem' }}
        onClick={onAddItem}
        aria-label={t('add_item')}
      >
        +
      </button>
    </div>
  );
}
