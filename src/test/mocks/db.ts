import type { Item, HistoryItem, ItemCategory } from '../../types';
import { vi } from 'vitest';

const store: Record<string, Item[]> = { foods: [], medicines: [] };
const historyStore: Record<string, HistoryItem[]> = { foods: [], medicines: [] };
let nextId = 1;

export const getAllItems = vi.fn(async (category: ItemCategory): Promise<Item[]> => {
  return store[category] ?? [];
});

export const addItem = vi.fn(async (category: ItemCategory, item: Omit<Item, 'id'>): Promise<number> => {
  const id = nextId++;
  store[category] = [...(store[category] ?? []), { ...item, id }];
  return id;
});

export const updateItem = vi.fn(async (category: ItemCategory, item: Item): Promise<void> => {
  store[category] = (store[category] ?? []).map((i) => (i.id === item.id ? item : i));
});

export const deleteItem = vi.fn(async (category: ItemCategory, id: number): Promise<void> => {
  store[category] = (store[category] ?? []).filter((i) => i.id !== id);
});

export const getHistory = vi.fn(async (category: ItemCategory): Promise<HistoryItem[]> => {
  return historyStore[category] ?? [];
});

export const putHistory = vi.fn(async (_category: ItemCategory, _entry: HistoryItem): Promise<void> => {});

export const exportDb = vi.fn(async (): Promise<string> => JSON.stringify(store));

export const importDb = vi.fn(async (_json: string): Promise<void> => {});
