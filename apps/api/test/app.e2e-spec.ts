import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { z } from 'zod';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/setup-app.js';

// e2e нужен запущенный Postgres: docker compose up -d db

// Тестовый контроллер только для проверки глобального Zod-пайпа.
const echoSchema = z.object({ name: z.string().min(1) });
type EchoDto = z.infer<typeof echoSchema>;

@Controller('echo')
class EchoController {
  @Post()
  echo(@Body({ schema: echoSchema }) body: EchoDto): EchoDto {
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
      .send({ name: '' })
      .expect(400);
  });

  it('Zod-пайп: верное тело проходит', () => {
    return request(app.getHttpServer())
      .post('/api/echo')
      .send({ name: 'Холодильник' })
      .expect(201)
      .expect({ name: 'Холодильник' });
  });

  it('Swagger отдаёт спецификацию с /api/health', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    expect(res.body.paths).toHaveProperty('/api/health');
  });
});
