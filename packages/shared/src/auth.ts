import { z } from 'zod';
import { householdSummarySchema } from './household.js';

// ---------- Вход в API (то, что присылает форма) ----------

// Email приводим к виду «без пробелов, маленькими буквами» ДО проверки формата:
// иначе ' Lev@Mail.ru' не пройдёт, а 'Lev@mail.ru' и 'lev@mail.ru' станут
// двумя разными аккаунтами.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Введите корректный email'));

// 72 — предел bcrypt: всё, что длиннее, он молча обрезает.
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен быть не короче 8 символов')
  .max(72, 'Пароль должен быть не длиннее 72 символов');

// POST /api/auth/register
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1, 'Введите имя').max(60, 'Имя слишком длинное'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// POST /api/auth/login. Длину пароля здесь не проверяем: неверный пароль
// должен давать общий ответ «неверный email или пароль», а не подсказку.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- Ответы API ----------

// Публичные данные пользователя. passwordHash сюда не попадает никогда.
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});
export type UserDto = z.infer<typeof userSchema>;

// Ответ register, login и GET /api/auth/me.
export const meSchema = z.object({
  user: userSchema,
  households: z.array(householdSummarySchema),
});
export type MeDto = z.infer<typeof meSchema>;

// Ответ POST /api/auth/mcp-token.
export const mcpTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime(),
});
export type McpTokenDto = z.infer<typeof mcpTokenSchema>;

// Имя httpOnly-cookie с JWT. Одно на api и web.
export const AUTH_COOKIE_NAME = 'home_token';
