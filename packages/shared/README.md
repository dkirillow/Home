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

## Правила

Контракт меняем отдельным маленьким PR, который мержится первым, и пишем в чат: «поменял схему X, подтяни dev».
