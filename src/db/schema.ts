import type { DBSchema } from 'idb';
import type { Item, HistoryItem } from '../types';

export interface ExpiringProductsDB extends DBSchema {
  foods_os: {
    key: number;
    value: Item;
    indexes: { name: string; quantity: number; expiring_date: string };
  };
  medicines_os: {
    key: number;
    value: Item;
    indexes: { name: string; quantity: number; expiring_date: string };
  };
  foods_history_os: {
    key: string;
    value: HistoryItem;
  };
  medicines_history_os: {
    key: string;
    value: HistoryItem;
  };
}
