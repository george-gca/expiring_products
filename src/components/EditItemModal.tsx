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

const inputCls =
  'w-16 text-center rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent';
const stepperBtnCls =
  'px-3 py-2 rounded-md bg-slate-600 hover:bg-slate-500 text-slate-200 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-slate-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h5 className="text-base font-semibold text-slate-100">{item.name}</h5>
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
            {exceedsAvailableQuantity && (
              <div className="rounded-md bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 text-sm">
                {t('quantity_exceeded')}
              </div>
            )}

            {/* Opened stepper */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">{t('opened_items')}</label>
              <div className="flex items-center gap-2">
                <button type="button" className={stepperBtnCls} onClick={() => setOpened(Math.max(0, opened - 1))}>−</button>
                <input
                  type="number"
                  min={0}
                  value={opened}
                  onChange={(e) => setOpened(Number(e.target.value))}
                  className={inputCls}
                />
                <button type="button" className={stepperBtnCls} onClick={() => setOpened(opened + 1)}>+</button>
              </div>
            </div>

            {/* Consumed stepper */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">{t('consumed_items')}</label>
              <div className="flex items-center gap-2">
                <button type="button" className={stepperBtnCls} onClick={() => setConsumed(Math.max(0, consumed - 1))}>−</button>
                <input
                  type="number"
                  min={0}
                  value={consumed}
                  onChange={(e) => setConsumed(Number(e.target.value))}
                  className={inputCls}
                />
                <button type="button" className={stepperBtnCls} onClick={() => setConsumed(consumed + 1)}>+</button>
              </div>
            </div>

            {/* Discarded stepper */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">{t('discarded_items')}</label>
              <div className="flex items-center gap-2">
                <button type="button" className={stepperBtnCls} onClick={() => setDiscarded(Math.max(0, discarded - 1))}>−</button>
                <input
                  type="number"
                  min={0}
                  value={discarded}
                  onChange={(e) => setDiscarded(Number(e.target.value))}
                  className={inputCls}
                />
                <button type="button" className={stepperBtnCls} onClick={() => setDiscarded(discarded + 1)}>+</button>
              </div>
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
              disabled={exceedsAvailableQuantity}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {t('edit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
