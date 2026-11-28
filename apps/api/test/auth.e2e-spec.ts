import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { setupApp } from '../src/setup-app.js';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;
  let prisma: PrismaService;

  //Уникальный email для каждого запуска тестов
  const email = `auth-${Date.now()}@example.com`;
  const password = 'test12345';
  const name = 'Тестовый пользователь';

  let householdId: string | undefined;

  beforeAll(async () => {
    //Создаём настоящее тестовое NestJS-приложение
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();

    //Получаем PrismaService из контейнера NestJS
    prisma = app.get(PrismaService);

    //Agent сохраняет cookie между запросами
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    //Удаляем созданного тестового пользователя
    await prisma.user.deleteMany({
      where: { email },
    });

    //Дом не удаляется вместе с пользователем
    if (householdId) {
      await prisma.household.deleteMany({
        where: { id: householdId },
      });
    }

    await app.close();
  });

  it('POST /api/auth/register → 201 и создаёт аккаунт', async () => {
    const response = await agent
      .post('/api/auth/register')
      .send({
        email,
        password,
        name,
      })
      .expect(201);

    //Проверяем безопасный ответ
    expect(response.body.user).toMatchObject({
      email,
      name,
    });
    expect(response.body.user).not.toHaveProperty(
      'passwordHash',
    );
    expect(response.body).not.toHaveProperty(
      'accessToken',
    );

    //Проверяем первый дом пользователя
    expect(response.body.households).toHaveLength(1);
    expect(response.body.households[0]).toMatchObject({
      name: 'Мой дом',
      role: 'OWNER',
    });

    householdId = response.body.households[0].id;

    //Проверяем безопасную cookie
    const cookies = response.headers['set-cookie'];
    const cookieHeader = Array.isArray(cookies)
      ? cookies.join(';')
      : cookies;

    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(
      'home_token=',
    );
    expect(cookieHeader).toContain(
      'HttpOnly',
    );

    //Проверяем, что в БД хранится хеш
    const storedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        passwordHash: true,
      },
    });

    expect(storedUser).not.toBeNull();
    expect(storedUser?.passwordHash).not.toBe(
      password,
    );
  });

  it('повторный email → 409', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password,
        name,
      })
      .expect(409);
  });

  it('невалидная регистрация → 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'не-email',
        password: '123',
        name: '',
      })
      .expect(400);
  });

  it('неверный пароль → 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email,
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('правильный вход → 200 и cookie', async () => {
    const response = await agent
      .post('/api/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    expect(response.body.user.email).toBe(email);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('GET /api/auth/me с cookie → 200', async () => {
    const response = await agent
      .get('/api/auth/me')
      .expect(200);

    expect(response.body.user.email).toBe(email);
    expect(response.body.households[0]).toMatchObject({
      name: 'Мой дом',
      role: 'OWNER',
    });
  });

  it('POST /api/auth/logout → 204', async () => {
    await agent
      .post('/api/auth/logout')
      .expect(204);
  });

  it('GET /api/auth/me после logout → 401', async () => {
    await agent
      .get('/api/auth/me')
      .expect(401);
  });
});
