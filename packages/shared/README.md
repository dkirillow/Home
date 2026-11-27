# @home/shared

Общие контракты Home: Zod-схемы входа, DTO-типы ответов и константы. Одна схема проверяет форму на фронте, тело запроса в API и вход MCP-инструмента.

Пакет собирается в `dist/` автоматически при `pnpm install` и пересобирается на лету в `pnpm dev`.

## Подключение

```bash
pnpm --filter web add "@home/shared@workspace:*"   # api уже подключён
```

## Пример: API (NestJS 12)

```ts
import { registerSchema, type RegisterInput, type MeDto } from '@home/shared';

@Post('register')
register(@Body({ schema: registerSchema }) dto: RegisterInput): Promise<MeDto> {
  // dto уже проверен и нормализован: email без пробелов и в нижнем регистре
}
```

Неверное тело → 400. Схема сама попадает в Swagger.

## Пример: web (react-hook-form)

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@home/shared';

const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
```

## Что есть

| Экспорт | Для чего |
| --- | --- |
| `registerSchema` / `RegisterInput` | `POST /api/auth/register`: email, password (8–72), name |
| `loginSchema` / `LoginInput` | `POST /api/auth/login` |
| `UserDto`, `MeDto` | ответ register, login, `GET /api/auth/me` |
| `McpTokenDto` | ответ `POST /api/auth/mcp-token` |
| `HouseholdSummaryDto`, `MemberRole`, `MEMBER_ROLE_LABELS` | дома пользователя и роли |
| `AUTH_COOKIE_NAME` | имя httpOnly-cookie с JWT: `home_token` |
| `MemberDto` | `GET …/members` |
| `create…Schema`, `update…Schema`, `…QuerySchema`, `…Dto` | asset, document, expense, payment, task, shopping: тело, query и ответ каждого роута раздела 6 |
| `ASSET_CATEGORIES`, `EXPENSE_CATEGORIES`, … и `…_LABELS` | значения enum из Prisma и русские подписи для селектов и бейджей |
| `getWarrantyStatus()`, `WARRANTY_STATUS_LABELS` | статус гарантии: none / expired / expiring (≤ 30 дн.) / active |
| `DashboardDto`, `UPCOMING_EVENTS_DAYS`, `UPCOMING_EVENTS_LIMIT` | `GET …/dashboard` |
| `TIMEZONE`, `toDateKey()`, `daysUntil()` | «сегодня» и «через N дней» по Москве, а не по UTC сервера |

## Правила

- Даты в запросах — ISO-строки (`'2026-12-01'` из `<input type="date">`), схема сама превращает их в `Date`. `z.coerce.date()` не используем: Swagger не умеет описать `Date` и падает при старте.
- В `create…Schema` нет `.default()`: `update…Schema = create…Schema.partial()`, и default перезаписал бы поле в PATCH. Значения по умолчанию ставит Prisma.
- Пустая строка из формы превращается в `null`: в PATCH это «очистить поле».
- Новая входная схема автоматически попадает в тест «конвертируется в OpenAPI», если её имя `create…Schema`, `update…Schema` или `…QuerySchema`.

Контракт меняем отдельным маленьким PR, который мержится первым, и пишем в чат: «поменял схему X, подтяни dev».
