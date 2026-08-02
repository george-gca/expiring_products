export interface Item {
  id?: number;
  name: string;
  quantity: number;
  expiring_date: string; // ISO date string
  duration: number; // days after opening
  date_opened: string | null;
  opened: boolean;
}

export interface HistoryItem {
  name: string; // PK
  duration: number;
}

export type ItemCategory = 'foods' | 'medicines';
