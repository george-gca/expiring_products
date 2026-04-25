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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-slate-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h5 className="text-base font-semibold text-slate-100">{t('add_item')}</h5>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="text-slate-400 hover:text-slate-100 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-300">{t('item_name')}</label>
              <input
                type="text"
                list="history-datalist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <datalist id="history-datalist">
                {history.map((h) => <option key={h.name} value={h.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-300">{t('quantity')}</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-300">{t('expire_in')}</label>
              <input
                type="date"
                value={expiringDate}
                onChange={(e) => setExpiringDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-300">{t('duration')}</label>
              <input
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {t('close')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {t('add_item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
