import { z } from 'zod';

// Схема переменных окружения API. ConfigModule прогоняет через неё .env при
// старте: если чего-то не хватает, приложение падает сразу и пишет, чего именно.
export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL не задан'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET не задан'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Неверные переменные окружения (apps/api/.env):\n${problems}`);
  }
  return result.data;
}
