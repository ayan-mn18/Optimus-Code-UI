import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Mon, 4 Aug" — dates from the API are plain YYYY-MM-DD, so parse them as local. */
export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
}

export function relativeDay(iso: string, today: string) {
  if (iso === today) return 'Today';
  const diff = Math.round((Date.parse(iso) - Date.parse(today)) / 86_400_000);
  if (diff === -1) return 'Yesterday';
  if (diff < -1 && diff > -7) return `${-diff} days ago`;
  return formatDate(iso);
}

export const pluralize = (count: number, word: string, plural = `${word}s`) =>
  `${count} ${count === 1 ? word : plural}`;

export const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export function youtubeWatchUrl(value: string) {
  try {
    const source = new URL(value);
    const embedMatch = source.pathname.match(/^\/embed\/([^/]+)/);
    if (!embedMatch) return value;
    const watch = new URL('https://www.youtube.com/watch');
    watch.searchParams.set('v', embedMatch[1]);
    const start = source.searchParams.get('start');
    if (start) watch.searchParams.set('t', `${start}s`);
    return watch.toString();
  } catch {
    return value;
  }
}
