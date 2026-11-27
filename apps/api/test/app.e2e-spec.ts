import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { registerSchema, type RegisterInput } from '@home/shared';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/setup-app.js';

// e2e нужен запущенный Postgres: docker compose up -d db

// Тестовый контроллер только для проверки глобального Zod-пайпа
// со схемой из @home/shared (так же будет в настоящем AuthController).
@Controller('echo')
class EchoController {
  @Post()
  echo(@Body({ schema: registerSchema }) body: RegisterInput): RegisterInput {
    return body;
  }
}

describe('API skeleton (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [EchoController],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health → 200, БД отвечает', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', db: 'up' });
  });

  it('роуты без префикса /api не существуют', () => {
    return request(app.getHttpServer()).get('/health').expect(404);
  });

  it('Zod-пайп: неверное тело → 400', () => {
    return request(app.getHttpServer())
      .post('/api/echo')
      .send({ email: 'lev.mail.ru', password: '123', name: '' })
      .expect(400);
  });

  it('Zod-пайп: верное тело проходит и нормализуется схемой', () => {
    return request(app.getHttpServer())
      .post('/api/echo')
      .send({ email: '  Lev@Mail.RU ', password: '12345678', name: ' Лев ' })
      .expect(201)
      .expect({ email: 'lev@mail.ru', password: '12345678', name: 'Лев' });
  });

  it('Swagger отдаёт спецификацию с /api/health и схемой тела', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    expect(res.body.paths).toHaveProperty('/api/health');
    // Zod-схема из @home/shared попала в Swagger как тело запроса
    expect(JSON.stringify(res.body.paths['/api/echo'])).toContain('password');
  });
});
