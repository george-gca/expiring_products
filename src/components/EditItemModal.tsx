import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useItemMutations } from '../hooks/useItemMutations';
import type { Item, ItemCategory } from '../types';

interface EditItemModalProps {
  show: boolean;
  item: Item;
  category: ItemCategory;
  onClose: () => void;
}

export default function EditItemModal({ show, item, category, onClose }: EditItemModalProps) {
  const { t } = useTranslation();
  const { openItem, consumeItem, discardItem } = useItemMutations();
  const [opened, setOpened] = useState(0);
  const [consumed, setConsumed] = useState(0);
  const [discarded, setDiscarded] = useState(0);

  const total = opened + consumed + discarded;
  const exceedsAvailableQuantity = total > item.quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (exceedsAvailableQuantity) return;

    // Each operation may change the item's quantity in the DB, so we pass a
    // synthetic item with the remaining quantity to avoid using stale data in
    // successive operations within the same submission.
    let remaining = item.quantity;

    if (opened > 0) {
      await openItem(category, item.id!, opened, [item]);
      remaining -= opened;
    }
    if (consumed > 0 && remaining > 0) {
      await consumeItem(category, item.id!, consumed, [{ ...item, quantity: remaining }]);
      remaining -= consumed;
    }
    if (discarded > 0 && remaining > 0) {
      await discardItem(category, item.id!, discarded, [{ ...item, quantity: remaining }]);
    }
    onClose();
  }

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{item.name}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label={t('close')} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {exceedsAvailableQuantity && <div className="alert alert-danger">{t('quantity_exceeded')}</div>}
              <div className="mb-3">
                <label className="form-label">{t('opened_items')}</label>
                <div className="input-group">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setOpened(Math.max(0, opened - 1))}>-</button>
                  <input type="number" className="form-control text-center" min={0} value={opened} onChange={(e) => setOpened(Number(e.target.value))} />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setOpened(opened + 1)}>+</button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('consumed_items')}</label>
                <div className="input-group">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setConsumed(Math.max(0, consumed - 1))}>-</button>
                  <input type="number" className="form-control text-center" min={0} value={consumed} onChange={(e) => setConsumed(Number(e.target.value))} />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setConsumed(consumed + 1)}>+</button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('discarded_items')}</label>
                <div className="input-group">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setDiscarded(Math.max(0, discarded - 1))}>-</button>
                  <input type="number" className="form-control text-center" min={0} value={discarded} onChange={(e) => setDiscarded(Number(e.target.value))} />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setDiscarded(discarded + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('close')}</button>
              <button type="submit" className="btn btn-primary" disabled={exceedsAvailableQuantity}>{t('edit')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
