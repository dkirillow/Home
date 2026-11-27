import { z } from 'zod';

// «Ближайшие события»: DashboardService собирает их на 14 дней вперёд и отдаёт топ-5.
export const UPCOMING_EVENTS_DAYS = 14;
export const UPCOMING_EVENTS_LIMIT = 5;

export const UPCOMING_EVENT_KINDS = ['payment', 'task', 'warranty', 'service'] as const;
export const upcomingEventKindSchema = z.enum(UPCOMING_EVENT_KINDS);
export type UpcomingEventKind = z.infer<typeof upcomingEventKindSchema>;

export const UPCOMING_EVENT_KIND_LABELS: Record<UpcomingEventKind, string> = {
  payment: 'Платёж',
  task: 'Задача',
  warranty: 'Гарантия',
  service: 'Обслуживание',
};

export const upcomingEventSchema = z.object({
  kind: upcomingEventKindSchema,
  id: z.string(),
  title: z.string(),
  date: z.iso.datetime(),
  amount: z.number().int().optional(), // только у платежей
  href: z.string(), // куда ведёт стрелка «>»
});
export type UpcomingEventDto = z.infer<typeof upcomingEventSchema>;

// GET …/dashboard — форма из раздела 6 методички.
export const dashboardSchema = z.object({
  assets: z.object({ total: z.number().int(), warrantiesExpiringSoon: z.number().int() }),
  finances: z.object({ monthTotal: z.number().int(), upcomingPayments: z.number().int() }),
  documents: z.object({ total: z.number().int() }),
  tasks: z.object({ active: z.number().int(), today: z.number().int() }),
  upcomingEvents: z.array(upcomingEventSchema),
});
export type DashboardDto = z.infer<typeof dashboardSchema>;
