import {ConflictException, Injectable, UnauthorizedException,} from '@nestjs/common';//409, внедрение зависимости, 401
import { JwtService } from '@nestjs/jwt';                                            //Сервис подписи и проверки JWT
import { compare, hash } from 'bcrypt';                                              //Сравнение пароля и Хеширование
import { type MeDto, type RegisterInput, type LoginInput,} from '@home/shared';      //Тип безопасного ответа с пользователем и домами. Тип проверенных данных регистрации. Тип проверенных данных входа
import { MemberRole, Prisma,} from '../../generated/prisma/client.js';               //Роли пользователя внутри дома, Типы и ошибки Prisma
import { PrismaService } from '../../prisma/prisma.service.js';                      //Сервис доступа к PostgreSQL

type AuthSession = {
  accessToken: string; //Подписанный JWT
  data: MeDto;         //Безопасные данные без passwordHash
};


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,   //Работа с PostgreSQL
    private readonly jwtService: JwtService,  //Работа с JWT
  ) {}

  async register(input: RegisterInput): Promise<AuthSession> { //Регистрируем пользователя и создаём его первый дом
    const existingUser = await this.prisma.user.findUnique({   //Проверяем, нет ли пользователя с таким email
      where: { email: input.email },                           //Ищем по уникальному email
      select: { id: true },                                    //Получаем только ID
    });

    if (existingUser) { 
      throw new ConflictException('Пользователь с таким email уже существует',);} //Не разрешаем повторную регистрацию

    const passwordHash = await hash(input.password, 12);                          //Превращаем пароль в необратимый хеш

    try {                                                                         //Все три записи создаются вместе или вместе откатываются
      const userId = await this.prisma.$transaction(
        async (transaction) => {
          const user = await transaction.user.create({                            //Создаём пользователя
            data: {
              email: input.email,
              name: input.name,
              passwordHash,
            },
          });

          const household = await transaction.household.create({                              //Создаём первый дом пользователя
            data: {
              name: 'Мой дом',
            },
          });

          await transaction.membership.create({                                               //Связываем пользователя с домом как владельца
            data: {
              userId: user.id,
              householdId: household.id,
              role: MemberRole.OWNER,
            },
          });

          return user.id;                                                                     //Возвращаем ID из транзакции
        },
      );

      
      return this.createSession(userId);                                                      //Создаём JWT и получаем безопасный профиль
    } catch (error) {
      
      if ( error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { //P2002 означает нарушение уникальности в базе
        throw new ConflictException('Пользователь с таким email уже существует',);}
    throw error;                                                                              //Неизвестную ошибку передаём дальше
    }
  }


async login(input: LoginInput): Promise<AuthSession> {                                     //Проверяем email и пароль пользователя
  const user = await this.prisma.user.findUnique({                                         //Ищем пользователя вместе с хешем пароля
    where: { email: input.email },
    select: {
      id: true,
      passwordHash: true,
    },});

  if (!user) {throw new UnauthorizedException('Неверный email или пароль',);}            //Не раскрываем, существует ли такой email

  const isPasswordValid = await compare(                                                 //Сравниваем введённый пароль с хешем из базы
    input.password,
    user.passwordHash,);
  
  if (!isPasswordValid) {throw new UnauthorizedException('Неверный email или пароль',);} //Не создаём JWT при неверном пароле

  return this.createSession(user.id);                                                    //Создаём JWT и возвращаем безопасный профиль
}

  async getMe(userId: string): Promise<MeDto> {                                          //Получаем безопасные данные пользователя по его ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },                                                             //Ищем пользователя по ID
      select: {
        id: true,                                                                        //Публичный ID
        name: true,                                                                      //Имя пользователя
        email: true,                                                                     //Email пользователя
        memberships: {                                                                   //Связи пользователя с домами
          select: {
            role: true,                                                                  //Роль в конкретном доме
            household: {
              select: {
                id: true,                                                                //ID дома
                name: true,                                                              //Название дома
              },},},},},});
                                                     
    if (!user) {throw new UnauthorizedException( 'Пользователь не найден',);}            //Не продолжаем работу, если пользователь не найде
                                                                
    return {                                                                             //Формируем ответ без passwordHash
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      households: user.memberships.map((membership) => ({
        id: membership.household.id,
        name: membership.household.name,
        role: membership.role,
      })),};}

  
async getMeByToken(token?: string): Promise<MeDto> {                                     //Получаем профиль по JWT из cookie
  
  if (!token) {throw new UnauthorizedException('Необходима авторизация',);}              //Без токена пользователь не авторизован

  let userId: string;

  try { const payload = await this.jwtService.verifyAsync<{sub: string;}>(token);        //Проверяем подпись и срок действия JWT

    if (typeof payload.sub !== 'string') { throw new Error('Invalid token');}            //В поле sub обязательно должен находиться ID

    userId = payload.sub;
  } catch { throw new UnauthorizedException('Недействительный токен',);}                 //Любая ошибка JWT превращается в HTTP 401

  return this.getMe(userId);                                                             //Получаем пользователя по ID из проверенного JWT
}
 
  private async createSession(                            //Создаём токен и собираем данные сессии
    userId: string,                                       //ID записывается внутрь JWT
  ): Promise<AuthSession> {
                                                          //Подписываем JWT и одновременно загружаем профиль
    const [accessToken, data] = await Promise.all([
      this.jwtService.signAsync({ sub: userId }),
      this.getMe(userId),
    ]);

    //Токен получит Controller, а data отправится клиенту
    return { accessToken, data};
  }
}