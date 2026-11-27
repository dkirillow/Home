import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Единственная точка доступа к БД. Сервисы модулей получают его через DI:
// constructor(private readonly prisma: PrismaService) {}
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    // Prisma 7 подключается к Postgres через driver adapter (драйвер pg).
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
    });
    super({ adapter });
  }

  // Подключаемся при старте, чтобы неверный DATABASE_URL был виден сразу.
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
