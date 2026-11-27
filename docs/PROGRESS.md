# Прогресс

## 27.11 — день 1

### Лев: блок A — скелет API (ветка `chore/api-skeleton`)

Готово:
- Монорепо: один workspace и один lock в корне, скрипты `dev`, `dev:api`, `dev:web`, `lint`, `typecheck`, `test`, `db:*`.
- `.gitignore`: `dist`, `.env`, `*.tsbuildinfo`, сгенерированный Prisma Client.
- API: `ConfigModule` с проверкой `.env` через Zod, порт 3001, префикс `/api`, Swagger на `/api/docs`, глобальный `StandardSchemaValidationPipe`.
- Prisma 7.10.1: схема из методички (9 моделей), миграция `init`, `PrismaService` + глобальный `PrismaModule`.
- `GET /api/health` (API + БД), unit- и e2e-тесты.

Проверено: typecheck, lint, 2 unit + 5 e2e тестов, ручной запуск (`/api/health` 200, Swagger 200, 9 таблиц в БД).

Решения, отличающиеся от методички:
- Валидация: встроенный `StandardSchemaValidationPipe` Nest 12 вместо `nestjs-zod` — тот не поддерживает Nest 12. Использование: `@Body({ schema: createXSchema }) dto: CreateXInput`.
- Prisma 7: генератор `prisma-client`, URL БД в `apps/api/prisma7.config.ts`, адаптер `@prisma/adapter-pg`.
- `.env` лежит в `apps/api/`, а не в корне.
- Postgres 17 (в методичке 16), тесты на Vitest (в методичке Jest).

Дальше: блок B — `packages/shared`.
