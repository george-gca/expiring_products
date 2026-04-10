import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddItemModal from '../../components/AddItemModal';

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

describe('AddItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when show is false', () => {
    const { container } = render(
      <AddItemModal show={false} category="foods" onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal fields when show is true', () => {
    render(<AddItemModal show={true} category="foods" onClose={vi.fn()} />);
    expect(screen.getAllByText('add_item').length).toBeGreaterThan(0);
    expect(screen.getByText('item_name')).toBeInTheDocument();
    expect(screen.getByText('quantity')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<AddItemModal show={true} category="foods" onClose={onClose} />);
    fireEvent.click(screen.getAllByText('close')[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('submit button is present', async () => {
    render(<AddItemModal show={true} category="foods" onClose={vi.fn()} />);
    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: 'add_item' });
      expect(submitBtn).toBeInTheDocument();
    });
  });
});
