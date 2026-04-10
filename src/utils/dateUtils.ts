import { DateTime, Interval } from 'luxon';

export function isExpired(isoDate: string): boolean {
  return DateTime.fromISO(isoDate) < DateTime.now();
}

export function isExpiringSoon(isoDate: string): boolean {
  const expiry = DateTime.fromISO(isoDate);
  const now = DateTime.now();
  if (expiry < now) return false;
  return Interval.fromDateTimes(now, expiry).length('days') <= 3;
}

export function toRelative(isoDate: string, locale: string): string {
  return DateTime.fromISO(isoDate).setLocale(locale).toRelative() ?? '';
}

export function todayISO(): string {
  return DateTime.now().toISODate() ?? '';
}
