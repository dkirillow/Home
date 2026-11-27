# Home

Адаптивное веб-приложение «дом, который помнит всё за тебя»: имущество, документы, финансы и домашние дела в одном Household, плюс AI-помощник.

Монорепо на pnpm workspaces:

| Папка | Что это | Порт |
| --- | --- | --- |
| `apps/web` | Next.js (App Router), React 19 | 3000 |
| `apps/api` | NestJS 12, Prisma 7, PostgreSQL | 3001 |
| `packages/*` | общие пакеты (`@home/shared` — Zod-схемы и типы) | — |

## Локальный запуск

Нужны Node.js 24 (LTS), pnpm 12 и Docker.

```bash
nvm use                                   # Node 24 из .nvmrc
pnpm install                              # зависимости + генерация Prisma Client
cp apps/api/.env.example apps/api/.env    # заполнить пароль БД и JWT_SECRET
pnpm db:up                                # Postgres в Docker на порту 5433
pnpm db:migrate                           # применить миграции
pnpm dev                                  # web :3000 + api :3001
```

Проверка API:
- http://localhost:3001/api/health → `{"status":"ok","db":"up"}`
- http://localhost:3001/api/docs → Swagger

## Команды

| Команда | Что делает |
| --- | --- |
| `pnpm dev` | web и api вместе |
| `pnpm dev:api` / `pnpm dev:web` | по отдельности |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | проверки во всех пакетах |
| `pnpm db:up` | поднять Postgres |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:studio` | Prisma Studio: посмотреть данные |

## Правила

- Ветки от `dev`, слияние через PR. Схему БД (`apps/api/prisma/schema.prisma`) меняет только Лев отдельным PR `chore/db-*`.
- Секреты только в `.env`, в Git — `.env.example`.
