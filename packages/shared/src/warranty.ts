import { z } from 'zod';
import { daysUntil } from './dates.js';

// Статус гарантии не хранится в БД, а вычисляется из Asset.warrantyUntil.
export const WARRANTY_STATUSES = ['none', 'expired', 'expiring', 'active'] as const;
export const warrantyStatusSchema = z.enum(WARRANTY_STATUSES);
export type WarrantyStatus = z.infer<typeof warrantyStatusSchema>;

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  none: 'Без гарантии',
  expired: 'Гарантия истекла',
  expiring: 'Гарантия скоро истекает',
  active: 'На гарантии',
};

export const WARRANTY_EXPIRING_DAYS = 30;

// нет даты → none; дата прошла → expired; ≤ 30 дней → expiring; иначе active.
// Последний день гарантии ещё считается действующим.
export function getWarrantyStatus(
  warrantyUntil: Date | string | null | undefined,
  now: Date = new Date(),
): WarrantyStatus {
  if (!warrantyUntil) return 'none';
  const days = daysUntil(warrantyUntil, now);
  if (days < 0) return 'expired';
  if (days <= WARRANTY_EXPIRING_DAYS) return 'expiring';
  return 'active';
}
