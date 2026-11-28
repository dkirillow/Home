import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

// Корневой модуль. Сюда подключаются модули разделов: auth, households, inventory, expenses и т. д. Правим минимально: файл общий для двоих.
@Module({
  imports: [
    // Читает apps/api/.env, проверяет его схемой и делает ConfigService доступным во всех модулях.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    HealthModule,
    AuthModule,                            //Подключаем маршруты и сервис Auth
  ],
})
export class AppModule {}
