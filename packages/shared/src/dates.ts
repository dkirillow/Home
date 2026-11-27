// Все «сегодня», «просрочено», «через N дней» считаем по календарю Москвы,
// а не по часовому поясу сервера (Railway живёт в UTC).
export const TIMEZONE = 'Europe/Moscow';

const DAY_MS = 24 * 60 * 60 * 1000;

const dateKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Календарный день в Москве: '2026-12-01'. 2026-11-30T21:30Z → '2026-12-01'.
export function toDateKey(date: Date | string): string {
  return dateKeyFormat.format(new Date(date));
}

// Сколько календарных дней от now до date: 0 — сегодня, 1 — завтра, -1 — вчера.
export function daysUntil(date: Date | string, now: Date = new Date()): number {
  return Math.round((Date.parse(toDateKey(date)) - Date.parse(toDateKey(now))) / DAY_MS);
}
