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
  const invalid = total > item.quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (invalid) return;
    if (opened > 0) await openItem(category, item.id!, opened, [item]);
    if (consumed > 0) await consumeItem(category, item.id!, consumed, [item]);
    if (discarded > 0) await discardItem(category, item.id!, discarded, [item]);
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
              {invalid && <div className="alert alert-danger">Total exceeds quantity ({item.quantity})</div>}
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
              <button type="submit" className="btn btn-primary" disabled={invalid}>{t('edit')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
