import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const prisma = { $queryRaw: vi.fn() };
  let controller: HealthController;

  beforeEach(async () => {
    prisma.$queryRaw.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('возвращает ok, когда БД отвечает', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    await expect(controller.check()).resolves.toEqual({ status: 'ok', db: 'up' });
  });

  it('отдаёт 503, когда БД недоступна', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
