import { DateTime } from 'luxon';
import type { Item } from '../types';

export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const dateA = DateTime.fromISO(a.expiring_date).toMillis();
    const dateB = DateTime.fromISO(b.expiring_date).toMillis();
    if (dateA !== dateB) return dateA - dateB;
    if (a.opened !== b.opened) return (b.opened ? 1 : 0) - (a.opened ? 1 : 0);
    return b.quantity - a.quantity;
  });
}
