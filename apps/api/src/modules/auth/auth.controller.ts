import {
  Body,       //Получаем и проверяем тело запроса
  Controller, //Объявляем HTTP-контроллер
  Get,        //Обрабатываем GET-запрос
  HttpCode,   //Задаём HTTP-статус вручную
  Post,       //Обрабатываем POST-запрос
  Req,        //Получаем объект запроса
  Res,        //Получаем объект ответа
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger'; //Группируем маршруты в Swagger

import {
  AUTH_COOKIE_NAME,   //Общее имя cookie home_token
  loginSchema,        //Zod-схема входа
  registerSchema,     //Zod-схема регистрации
  type LoginInput,    //Тип проверенных данных входа
  type MeDto,         //Тип ответа с пользователем и домами
  type RegisterInput, //Тип проверенных данных регистрации
} from '@home/shared';

import type {
  CookieOptions, //Тип настроек cookie
  Request,       //Тип HTTP-запроса Express
  Response,      //Тип HTTP-ответа Express
} from 'express';

import { AuthService } from './auth.service.js'; //Бизнес-логика авторизации




//Общие безопасные настройки cookie
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,                                //JavaScript не может прочитать JWT
  secure: process.env.NODE_ENV === 'production', //На production только HTTPS
  sameSite: 'lax',                               //Ограничиваем межсайтовую отправку
  path: '/',                                     //Cookie действует на всём сайте
};

@ApiTags('Auth')                                 //Раздел Auth в Swagger
@Controller('auth')                              //Общий адрес маршрутов /auth
export class AuthController {
  constructor(
    private readonly authService: AuthService,) {}//Nest передаст AuthService

  //POST /api/auth/register
  @Post('register')
  async register(
    @Body({ schema: registerSchema })
    input: RegisterInput,                                                //Проверенные данные регистрации

    @Res({ passthrough: true })
    response: Response,): Promise<MeDto> {                               //Ответ нужен для установки cookie
  
    const { accessToken, data } = await this.authService.register(input);//Создаём пользователя и JWT

    this.setAuthCookie(response, accessToken);                           //Сохраняем JWT в httpOnly-cookie
    return data;                                                         //Возвращаем данные без JWT и passwordHash
  }


  //POST /api/auth/login
  @Post('login')
  @HttpCode(200)
  async login(
    @Body({ schema: loginSchema })
    input: LoginInput,                                                 //Проверенные данные входа

    @Res({ passthrough: true })
    response: Response,                                                //Ответ нужен для установки cookie
  ): Promise<MeDto> {
    
    const { accessToken, data } = await this.authService.login(input); //Проверяем пароль и создаём JWT

    this.setAuthCookie(response, accessToken);                         //Сохраняем JWT в httpOnly-cookie

    return data;                                                       //Возвращаем безопасный профиль
  }


  //POST /api/auth/logout
  @Post('logout')
  @HttpCode(204)                                                       //возвращает статус 204 без тела.
  logout(
    @Res({ passthrough: true })
    response: Response,
  ): void {
    //Удаляем cookie из браузера
    response.clearCookie(
      AUTH_COOKIE_NAME,
      COOKIE_OPTIONS,
    );
  }

  //GET /api/auth/me
  @Get('me')
  async me(
    @Req()
    request: Request,                                                          //Входящий запрос с разобранными cookie
  ): Promise<MeDto> {
    const token = request.cookies?.[ AUTH_COOKIE_NAME ] as string | undefined; //Получаем JWT из cookie

    return this.authService.getMeByToken(token);                               //Проверяем JWT и возвращаем профиль
  }

  //Устанавливаем JWT в безопасную cookie
  private setAuthCookie(
    response: Response,
    token: string,
  ): void {
    response.cookie(AUTH_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, //Срок cookie: 7 дней
    });
  }
}