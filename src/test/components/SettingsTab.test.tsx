import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsTab from '../../components/SettingsTab';

vi.mock('../../db', () => import('../mocks/db'));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

vi.mock('../../store/itemsStore', () => ({
  useItemsStore: (selector: (s: { revalidateKey: number; bump: () => void }) => unknown) =>
    selector({ revalidateKey: 0, bump: vi.fn() }),
}));

vi.mock('../../store/settingsStore', () => ({
  useSettingsStore: (selector?: (s: { language: string; setLanguage: () => void }) => unknown) => {
    const state = { language: 'en-us', setLanguage: vi.fn() };
    return selector ? selector(state) : state;
  },
}));

describe('SettingsTab', () => {
  it('renders export button', () => {
    render(<SettingsTab />);
    expect(screen.getByText('export_data')).toBeInTheDocument();
  });

  it('renders import file input', () => {
    render(<SettingsTab />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('renders language toggle button', () => {
    render(<SettingsTab />);
    // Language toggle shows opposite language label
    expect(screen.getByText('PT-BR')).toBeInTheDocument();
  });

  it('renders options heading', () => {
    render(<SettingsTab />);
    expect(screen.getByText('options')).toBeInTheDocument();
  });
});
