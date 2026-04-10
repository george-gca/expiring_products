import { DateTime } from 'luxon';
import { addItem as addItemToDb, updateItem as updateItemInDb, deleteItem as deleteItemFromDb, putHistory } from '../db';
import { useItemsStore } from '../store/itemsStore';
import type { Item, ItemCategory } from '../types';

export function useItemMutations() {
  const bump = useItemsStore((s) => s.bump);

  async function addItem(category: ItemCategory, item: Omit<Item, 'id'>) {
    await addItemToDb(category, item);
    await putHistory(category, { name: item.name, duration: item.duration });
    bump();
  }

  async function updateItem(category: ItemCategory, item: Item) {
    await updateItemInDb(category, item);
    bump();
  }

  async function deleteItem(category: ItemCategory, id: number) {
    await deleteItemFromDb(category, id);
    bump();
  }

  async function openItem(category: ItemCategory, id: number, quantity: number, items: Item[]) {
    const today = DateTime.now();
    const item = items.find((i) => i.id === id);
    if (!item) {
      console.warn(`openItem: item with id ${id} not found`);
      return;
    }

    const itemExpiry = DateTime.fromISO(item.expiring_date);
    let expiringDate: DateTime;

    if (itemExpiry < today) {
      expiringDate = itemExpiry;
    } else {
      expiringDate = today.plus({ days: item.duration }).endOf('day');
      if (expiringDate > itemExpiry) {
        expiringDate = itemExpiry;
      }
    }

    if (item.quantity > quantity) {
      await addItemToDb(category, {
        name: item.name,
        quantity,
        expiring_date: expiringDate.toISO()!,
        duration: item.duration,
        date_opened: today.toISO()!,
        opened: true,
      });
      await updateItemInDb(category, { ...item, quantity: item.quantity - quantity });
    } else {
      await updateItemInDb(category, {
        ...item,
        expiring_date: expiringDate.toISO()!,
        date_opened: today.toISO()!,
        opened: true,
      });
    }
    bump();
  }

  async function consumeItem(category: ItemCategory, id: number, quantity: number, items: Item[]) {
    const item = items.find((i) => i.id === id);
    if (!item) {
      console.warn(`consumeItem: item with id ${id} not found`);
      return;
    }
    if (item.quantity <= quantity) {
      await deleteItemFromDb(category, id);
    } else {
      await updateItemInDb(category, { ...item, quantity: item.quantity - quantity });
    }
    bump();
  }

  async function discardItem(category: ItemCategory, id: number, quantity: number, items: Item[]) {
    const item = items.find((i) => i.id === id);
    if (!item) {
      console.warn(`discardItem: item with id ${id} not found`);
      return;
    }
    if (item.quantity <= quantity) {
      await deleteItemFromDb(category, id);
    } else {
      await updateItemInDb(category, { ...item, quantity: item.quantity - quantity });
    }
    bump();
  }

  return { addItem, updateItem, deleteItem, openItem, consumeItem, discardItem };
}
