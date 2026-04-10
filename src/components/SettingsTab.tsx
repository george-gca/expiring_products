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
      <h5>{t('options')}</h5>
      <div className="d-flex flex-column gap-3 mt-3">
        <button className="btn btn-outline-primary" onClick={handleExport}>
          {t('export_data')}
        </button>
        <div>
          <label className="btn btn-outline-secondary">
            {t('import_data')}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="d-none"
              onChange={handleImport}
            />
          </label>
        </div>
        <LanguageToggle />
      </div>
    </div>
  );
}
