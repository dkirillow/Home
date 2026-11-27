import { z } from 'zod';
import { isoDateTime, nullableIsoDateTime, optionalDateInput, optionalId, optionalText, requiredText } from './common.js';

export const TASK_CATEGORIES = ['PAYMENTS', 'MAINTENANCE', 'PURCHASES', 'PROPERTY', 'CLEANING', 'OTHER'] as const;
export const taskCategorySchema = z.enum(TASK_CATEGORIES);
export type TaskCategory = z.infer<typeof taskCategorySchema>;

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  PAYMENTS: 'Платежи',
  MAINTENANCE: 'Обслуживание',
  PURCHASES: 'Покупки',
  PROPERTY: 'Имущество',
  CLEANING: 'Уборка',
  OTHER: 'Другое',
};

export const TASK_STATUSES = ['TODO', 'DONE'] as const;
export const taskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Нужно сделать',
  DONE: 'Выполнено',
};

// today = срок сегодня или просрочено и не выполнено; upcoming = срок после сегодня.
export const TASK_FILTERS = ['all', 'today', 'upcoming', 'done'] as const;
export const taskFilterSchema = z.enum(TASK_FILTERS);
export type TaskFilter = z.infer<typeof taskFilterSchema>;

export const TASK_FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'Все',
  today: 'Сегодня',
  upcoming: 'Предстоящие',
  done: 'Выполненные',
};

// Исполнитель: assigneeId = null → «Семья», свой id → «Я».
export const createTaskSchema = z.object({
  title: requiredText(120, 'Введите название'),
  description: optionalText(1000),
  category: taskCategorySchema.optional(),
  dueDate: optionalDateInput,
  assigneeId: optionalId,
  assetId: optionalId,
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Выполнение задачи = PATCH { status: 'DONE' }, поэтому status есть только в update.
export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// GET …/tasks?filter=all|today|upcoming|done (query — не partial, default безопасен)
export const tasksQuerySchema = z.object({
  filter: taskFilterSchema.default('all'),
});
export type TasksQuery = z.infer<typeof tasksQuerySchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: taskCategorySchema,
  dueDate: nullableIsoDateTime,
  status: taskStatusSchema,
  completedAt: nullableIsoDateTime,
  assigneeId: z.string().nullable(),
  assetId: z.string().nullable(),
  createdAt: isoDateTime,
});
export type TaskDto = z.infer<typeof taskSchema>;

// GET …/tasks/stats
export const taskStatsSchema = z.object({
  active: z.number().int(),
  today: z.number().int(),
  doneThisWeek: z.number().int(),
});
export type TaskStatsDto = z.infer<typeof taskStatsSchema>;
