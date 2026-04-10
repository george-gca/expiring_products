import { openDB } from 'idb';
import type { ExpiringProductsDB } from './schema';
import type { Item, HistoryItem, ItemCategory } from '../types';

const DB_NAME = 'expiring_dates_db';
const DB_VERSION = 1;

let dbPromise: ReturnType<typeof openDB<ExpiringProductsDB>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ExpiringProductsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('foods_os')) {
          const foodsStore = db.createObjectStore('foods_os', { keyPath: 'id', autoIncrement: true });
          foodsStore.createIndex('name', 'name');
          foodsStore.createIndex('quantity', 'quantity');
          foodsStore.createIndex('expiring_date', 'expiring_date');
        }
        if (!db.objectStoreNames.contains('medicines_os')) {
          const medsStore = db.createObjectStore('medicines_os', { keyPath: 'id', autoIncrement: true });
          medsStore.createIndex('name', 'name');
          medsStore.createIndex('quantity', 'quantity');
          medsStore.createIndex('expiring_date', 'expiring_date');
        }
        if (!db.objectStoreNames.contains('foods_history_os')) {
          db.createObjectStore('foods_history_os', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains('medicines_history_os')) {
          db.createObjectStore('medicines_history_os', { keyPath: 'name' });
        }
      },
    });
  }
  return dbPromise;
}

function getStoreName(category: ItemCategory): 'foods_os' | 'medicines_os' {
  return category === 'foods' ? 'foods_os' : 'medicines_os';
}

function getHistoryStoreName(category: ItemCategory): 'foods_history_os' | 'medicines_history_os' {
  return category === 'foods' ? 'foods_history_os' : 'medicines_history_os';
}

export async function getAllItems(category: ItemCategory): Promise<Item[]> {
  const db = await getDb();
  return db.getAll(getStoreName(category));
}

export async function addItem(category: ItemCategory, item: Omit<Item, 'id'>): Promise<number> {
  const db = await getDb();
  return db.add(getStoreName(category), item as Item);
}

export async function updateItem(category: ItemCategory, item: Item): Promise<void> {
  const db = await getDb();
  await db.put(getStoreName(category), item);
}

export async function deleteItem(category: ItemCategory, id: number): Promise<void> {
  const db = await getDb();
  await db.delete(getStoreName(category), id);
}

export async function getHistory(category: ItemCategory): Promise<HistoryItem[]> {
  const db = await getDb();
  return db.getAll(getHistoryStoreName(category));
}

export async function putHistory(category: ItemCategory, entry: HistoryItem): Promise<void> {
  const db = await getDb();
  await db.put(getHistoryStoreName(category), entry);
}

export async function exportDb(): Promise<string> {
  const db = await getDb();
  const foods = await db.getAll('foods_os');
  const medicines = await db.getAll('medicines_os');
  const foodsHistory = await db.getAll('foods_history_os');
  const medicinesHistory = await db.getAll('medicines_history_os');
  return JSON.stringify({ foods, medicines, foodsHistory, medicinesHistory });
}

export async function importDb(json: string): Promise<void> {
  const db = await getDb();
  const data = JSON.parse(json) as {
    foods: Item[];
    medicines: Item[];
    foodsHistory: HistoryItem[];
    medicinesHistory: HistoryItem[];
  };

  const tx1 = db.transaction('foods_os', 'readwrite');
  await tx1.store.clear();
  for (const item of data.foods ?? []) await tx1.store.put(item);
  await tx1.done;

  const tx2 = db.transaction('medicines_os', 'readwrite');
  await tx2.store.clear();
  for (const item of data.medicines ?? []) await tx2.store.put(item);
  await tx2.done;

  const tx3 = db.transaction('foods_history_os', 'readwrite');
  await tx3.store.clear();
  for (const item of data.foodsHistory ?? []) await tx3.store.put(item);
  await tx3.done;

  const tx4 = db.transaction('medicines_history_os', 'readwrite');
  await tx4.store.clear();
  for (const item of data.medicinesHistory ?? []) await tx4.store.put(item);
  await tx4.done;
}
