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

### Лев: блок B, шаги B1–B2 — `@home/shared` и контракт auth (ветка `chore/shared-auth`)

Готово:
- Пакет `packages/shared` (`@home/shared`): ESM, собирается `tsc` в `dist/` (скрипт `prepare` при `pnpm install`, `dev` — watch). Подключён в api (`workspace:*`).
- Схемы auth: `registerSchema`, `loginSchema`; DTO `UserDto`, `MeDto`, `McpTokenDto`, `HouseholdSummaryDto`; `MEMBER_ROLES`, `MEMBER_ROLE_LABELS`, `AUTH_COOKIE_NAME`.

Проверено: 8 unit-тестов схем, typecheck и lint всего монорепо, e2e api со схемой из shared (400 на неверное тело, нормализация email, схема в Swagger), `nest build`, импорт из Node.

Решение: shared отдаёт собранный JS, а не `.ts` — собранный api (`node dist/main.js`) не умеет выполнять `.ts` из `node_modules`.

Дальше: B3–B5 — константы, схемы и DTO остальных сущностей, `DashboardDto`, `getWarrantyStatus()`.
