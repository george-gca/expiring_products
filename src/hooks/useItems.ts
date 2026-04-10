import useSWR from 'swr';
import { getAllItems } from '../db';
import { useItemsStore } from '../store/itemsStore';
import type { ItemCategory } from '../types';

export function useItems(category: ItemCategory) {
  const revalidateKey = useItemsStore((s) => s.revalidateKey);
  return useSWR([category, revalidateKey], ([cat]) => getAllItems(cat));
}
