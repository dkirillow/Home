import { Module } from '@nestjs/common';                        //Декоратор Nest-модуля
import { ConfigModule, ConfigService, } from '@nestjs/config';  //Доступ к конфигурации приложения. //Чтение переменных окружения
import { JwtModule } from '@nestjs/jwt';                        //Настройка JwtService
import { AuthController } from './auth.controller.js';          //HTTP-маршруты Auth
import { AuthService } from './auth.service.js';                //Бизнес-логика Auth

@Module({
  imports: [
    JwtModule.registerAsync({                                   //Настраиваем JwtService через переменные окружения
      imports: [ConfigModule],                                  //Используем общую конфигурацию NestJS
      inject: [ConfigService],                                  //Передаём ConfigService в фабрику
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'), //Не запускаем Auth без JWT_SECRET
        signOptions: {expiresIn: '7d'},                         //Все JWT действуют 7 дней
      })})],

  controllers: [AuthController],    //Регистрируем четыре HTTP-маршрута
  providers: [AuthService],         //Регистрируем бизнес-логику
  exports: [AuthService, JwtModule] //Разрешаем использовать сервис другим модулям. Позже понадобится JwtAuthGuard
       
})
export class AuthModule {}