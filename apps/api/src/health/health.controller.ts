import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

export type HealthDto = { status: 'ok'; db: 'up' };

// GET /api/health — жив ли API и отвечает ли БД. Нужен для проверки
// запуска локально и для health check на Railway.
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка API и подключения к БД' })
  async check(): Promise<HealthDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('База данных недоступна');
    }
    return { status: 'ok', db: 'up' };
  }
}
