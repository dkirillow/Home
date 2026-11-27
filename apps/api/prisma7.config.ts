// Конфиг Prisma CLI (migrate, generate, studio). В Prisma 7 строка подключения
// живёт здесь, а не в schema.prisma. Файл создан командой `prisma init`.
// dotenv подгружает apps/api/.env: сам Prisma CLI .env не читает.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
