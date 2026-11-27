import { z } from 'zod';
import { isoDateTime, optionalText, requiredText } from './common.js';

// quantity — свободная строка: «2 шт», «1 л».
export const createShoppingItemSchema = z.object({
  name: requiredText(120, 'Введите название'),
  quantity: optionalText(40),
  isBought: z.boolean().optional(),
});
export type CreateShoppingItemInput = z.infer<typeof createShoppingItemSchema>;

// Отметить купленным = PATCH { isBought: true }.
export const updateShoppingItemSchema = createShoppingItemSchema.partial();
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>;

export const shoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.string().nullable(),
  isBought: z.boolean(),
  createdAt: isoDateTime,
});
export type ShoppingItemDto = z.infer<typeof shoppingItemSchema>;
