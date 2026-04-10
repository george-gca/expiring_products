import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useItemMutations } from '../hooks/useItemMutations';
import { getHistory } from '../db';
import { todayISO } from '../utils/dateUtils';
import type { ItemCategory, HistoryItem } from '../types';

interface AddItemModalProps {
  show: boolean;
  category: ItemCategory;
  onClose: () => void;
}

export default function AddItemModal({ show, category, onClose }: AddItemModalProps) {
  const { t } = useTranslation();
  const { addItem } = useItemMutations();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiringDate, setExpiringDate] = useState(todayISO());
  const [duration, setDuration] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (show) {
      getHistory(category).then(setHistory).catch(console.error);
      setName('');
      setQuantity(1);
      setExpiringDate(todayISO());
      setDuration(0);
    }
  }, [show, category]);

  useEffect(() => {
    const found = history.find((h) => h.name.toLowerCase() === name.toLowerCase());
    if (found) setDuration(found.duration);
  }, [name, history]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addItem(category, {
      name,
      quantity,
      expiring_date: expiringDate,
      duration,
      date_opened: null,
      opened: false,
    });
    onClose();
  }

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('add_item')}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label={t('close')} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t('item_name')}</label>
                <input
                  type="text"
                  className="form-control"
                  list="history-datalist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <datalist id="history-datalist">
                  {history.map((h) => <option key={h.name} value={h.name} />)}
                </datalist>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('quantity')}</label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('expire_in')}</label>
                <input
                  type="date"
                  className="form-control"
                  value={expiringDate}
                  onChange={(e) => setExpiringDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('duration')}</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('close')}</button>
              <button type="submit" className="btn btn-primary">{t('add_item')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
