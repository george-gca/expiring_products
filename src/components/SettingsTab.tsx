import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { exportDb, importDb } from '../db';
import { useItemsStore } from '../store/itemsStore';
import LanguageToggle from './LanguageToggle';

export default function SettingsTab() {
  const { t } = useTranslation();
  const bump = useItemsStore((s) => s.bump);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const json = await exportDb();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expiring-products-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importDb(text);
    bump();
  }

  return (
    <div>
      <h5 className="text-lg font-semibold mb-4 text-slate-100">{t('options')}</h5>
      <div className="flex flex-col gap-3">
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-md text-sm font-medium border border-violet-500 text-violet-300 hover:bg-violet-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {t('export_data')}
        </button>

        <label className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-slate-500 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-slate-400">
          {t('import_data')}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="sr-only"
            onChange={handleImport}
          />
        </label>

        <LanguageToggle />
      </div>
    </div>
  );
}
