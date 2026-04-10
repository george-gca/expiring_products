import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemCard from '../../components/ItemCard';
import type { Item } from '../../types';
import { DateTime } from 'luxon';

vi.mock('../../db');

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock settingsStore
vi.mock('../../store/settingsStore', () => ({
  useSettingsStore: (selector: (s: { language: string }) => unknown) =>
    selector({ language: 'en-us' }),
}));

const baseItem: Item = {
  id: 1,
  name: 'Milk',
  quantity: 2,
  expiring_date: DateTime.now().plus({ days: 10 }).toISO()!,
  duration: 5,
  date_opened: null,
  opened: false,
};

describe('ItemCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders item name and quantity', () => {
    const onEdit = vi.fn();
    render(<ItemCard item={baseItem} onEdit={onEdit} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('applies danger class when expired', () => {
    const expiredItem: Item = {
      ...baseItem,
      expiring_date: DateTime.now().minus({ days: 1 }).toISO()!,
    };
    const onEdit = vi.fn();
    const { container } = render(<ItemCard item={expiredItem} onEdit={onEdit} />);
    expect(container.firstChild).toHaveClass('list-group-item-danger');
  });

  it('applies warning class when expiring within 3 days', () => {
    const soonItem: Item = {
      ...baseItem,
      expiring_date: DateTime.now().plus({ hours: 48 }).toISO()!,
    };
    const onEdit = vi.fn();
    const { container } = render(<ItemCard item={soonItem} onEdit={onEdit} />);
    expect(container.firstChild).toHaveClass('list-group-item-warning');
  });

  it('has no danger/warning class when not expiring soon', () => {
    const onEdit = vi.fn();
    const { container } = render(<ItemCard item={baseItem} onEdit={onEdit} />);
    expect(container.firstChild).not.toHaveClass('list-group-item-danger');
    expect(container.firstChild).not.toHaveClass('list-group-item-warning');
  });

  it('calls onEdit when clicked', () => {
    const onEdit = vi.fn();
    render(<ItemCard item={baseItem} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Milk'));
    expect(onEdit).toHaveBeenCalledWith(baseItem);
  });

  it('shows opened badge when item is opened', () => {
    const openedItem: Item = { ...baseItem, opened: true };
    const onEdit = vi.fn();
    render(<ItemCard item={openedItem} onEdit={onEdit} />);
    expect(screen.getByText('opened_items')).toBeInTheDocument();
  });
});
