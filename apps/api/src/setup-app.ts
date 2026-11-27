import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const API_PREFIX = 'api';

// Общая настройка приложения. Вызывается и в main.ts, и в e2e-тестах,
// чтобы тесты проверяли то же приложение, что запускается на самом деле.
export function setupApp(app: INestApplication): void {
  // Все роуты начинаются с /api: /api/health, /api/auth/me, /api/households/...
  app.setGlobalPrefix(API_PREFIX);

  // Zod-валидация из коробки Nest 12: проверяет параметры, у которых указан
  // schema (@Body({ schema }), @Query({ schema }), @Param('id', { schema })).
  // Ошибка → 400. Остальные параметры пропускает без изменений.
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  // По SIGTERM (Ctrl+C, рестарт на Railway) Nest вызовет onModuleDestroy
  // и PrismaService закроет соединения с БД.
  app.enableShutdownHooks();

  // Swagger UI на /api/docs, JSON-спецификация на /api/docs-json.
  // Zod-схемы из @Body({ schema }) попадают в документацию автоматически.
  const config = new DocumentBuilder()
    .setTitle('Home API')
    .setDescription('REST API приложения Home: имущество, документы, финансы, дела')
    .setVersion('0.1.0')
    .addCookieAuth('home_token')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
