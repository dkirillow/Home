import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.js';

describe('registerSchema', () => {
  const valid = { email: 'lev@mail.ru', password: '12345678', name: 'Лев' };

  it('пропускает корректные данные', () => {
    expect(registerSchema.parse(valid)).toEqual(valid);
  });

  it('нормализует email: пробелы и регистр', () => {
    const result = registerSchema.parse({ ...valid, email: '  Lev@Mail.RU ' });
    expect(result.email).toBe('lev@mail.ru');
  });

  it('обрезает пробелы в имени', () => {
    expect(registerSchema.parse({ ...valid, name: '  Лев ' }).name).toBe('Лев');
  });

  it.each([
    ['email без @', { email: 'lev.mail.ru' }, 'Введите корректный email'],
    ['пароль короче 8', { password: '1234567' }, 'Пароль должен быть не короче 8 символов'],
    ['пароль длиннее 72', { password: 'x'.repeat(73) }, 'Пароль должен быть не длиннее 72 символов'],
    ['пустое имя', { name: '   ' }, 'Введите имя'],
  ])('отклоняет: %s', (_, patch, message) => {
    const result = registerSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe('loginSchema', () => {
  it('не проверяет длину пароля, только что он не пустой', () => {
    expect(loginSchema.safeParse({ email: 'lev@mail.ru', password: '1' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'lev@mail.ru', password: '' }).success).toBe(false);
  });
});
