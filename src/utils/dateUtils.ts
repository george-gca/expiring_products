import { DateTime, Interval } from 'luxon';
import type { Language } from '../store/settingsStore';

/**
 * Map an app Language value to the corresponding Luxon/BCP-47 locale string.
 * @param language - App language setting
 * @returns Luxon-compatible locale string
 */
export function appLocaleToLuxonLocale(language: Language): string {
  return language === 'en-US' ? 'en-US' : 'pt-BR';
}

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
