import { z } from 'zod';
import { amountInput, dateInput, isoDateTime, optionalText, requiredText } from './common.js';

// Общий справочник категорий для расходов и платежей (enum ExpenseCategory).
export const EXPENSE_CATEGORIES = [
  'GROCERIES',
  'UTILITIES',
  'INTERNET',
  'HOUSEHOLD_GOODS',
  'REPAIR',
  'APPLIANCES',
  'FURNITURE',
  'OTHER',
] as const;
export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  GROCERIES: 'Продукты',
  UTILITIES: 'Коммунальные услуги',
  INTERNET: 'Интернет и связь',
  HOUSEHOLD_GOODS: 'Бытовые товары',
  REPAIR: 'Ремонт',
  APPLIANCES: 'Техника',
  FURNITURE: 'Мебель',
  OTHER: 'Другое',
};

// Как в методичке, но date — ISO-строка вместо z.coerce.date() (см. common.ts).
export const createExpenseSchema = z.object({
  title: requiredText(120, 'Введите название'),
  amount: amountInput,
  category: expenseCategorySchema,
  date: dateInput,
  comment: optionalText(500),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// GET …/expenses?from&to&category
export const expensesQuerySchema = z.object({
  from: dateInput.optional(),
  to: dateInput.optional(),
  category: expenseCategorySchema.optional(),
});
export type ExpensesQuery = z.infer<typeof expensesQuerySchema>;

// GET …/expenses/summary?month=2026-12 (без month — текущий месяц)
export const expenseSummaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Месяц в формате ГГГГ-ММ')
    .optional(),
});
export type ExpenseSummaryQuery = z.infer<typeof expenseSummaryQuerySchema>;

export const expenseSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number().int(),
  category: expenseCategorySchema,
  date: isoDateTime,
  comment: z.string().nullable(),
  paymentId: z.string().nullable(), // не null — расход создан кнопкой «Оплачено»
  createdAt: isoDateTime,
});
export type ExpenseDto = z.infer<typeof expenseSchema>;

export const expenseSummarySchema = z.object({
  total: z.number().int(),
  byCategory: z.array(z.object({ category: expenseCategorySchema, total: z.number().int() })),
  averageLast3Months: z.number().int(),
});
export type ExpenseSummaryDto = z.infer<typeof expenseSummarySchema>;
