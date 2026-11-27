import { z } from 'zod';
import { amountInput, dateInput, isoDateTime, nullableIsoDateTime, requiredText } from './common.js';
import { expenseCategorySchema, expenseSchema } from './expense.js';

export const PAYMENT_STATUSES = ['PENDING', 'PAID'] as const;
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачен',
};

// status здесь нет: оплатить можно только через POST …/payments/:id/pay.
export const createPaymentSchema = z.object({
  title: requiredText(120, 'Введите название'),
  amount: amountInput,
  category: expenseCategorySchema.optional(), // в БД по умолчанию UTILITIES
  dueDate: dateInput,
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = createPaymentSchema.partial();
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

// GET …/payments?status=PENDING
export const paymentsQuerySchema = z.object({
  status: paymentStatusSchema.optional(),
});
export type PaymentsQuery = z.infer<typeof paymentsQuerySchema>;

export const paymentSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number().int(),
  category: expenseCategorySchema,
  dueDate: isoDateTime,
  status: paymentStatusSchema,
  paidAt: nullableIsoDateTime,
  createdAt: isoDateTime,
});
export type PaymentDto = z.infer<typeof paymentSchema>;

// POST …/payments/:id/pay — идемпотентно: повторный вызов вернёт тот же expense.
export const payPaymentResultSchema = z.object({
  payment: paymentSchema,
  expense: expenseSchema,
});
export type PayPaymentResultDto = z.infer<typeof payPaymentResultSchema>;
