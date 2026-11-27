import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as shared from './index.js';
import {
  createAssetSchema,
  createExpenseSchema,
  createTaskSchema,
  daysUntil,
  toDateKey,
  updateAssetSchema,
  updateTaskSchema,
} from './index.js';

// B3: массивы значений совпадают с enum в schema.prisma
describe('enum-ы совпадают с Prisma', () => {
  const prisma = readFileSync(new URL('../../../apps/api/prisma/schema.prisma', import.meta.url), 'utf8');
  const prismaEnum = (name: string) =>
    prisma.match(new RegExp(`enum ${name} \\{([^}]*)\\}`))?.[1]?.trim().split(/\s+/);

  it.each([
    ['MemberRole', shared.MEMBER_ROLES],
    ['AssetCategory', shared.ASSET_CATEGORIES],
    ['DocumentType', shared.DOCUMENT_TYPES],
    ['ExpenseCategory', shared.EXPENSE_CATEGORIES],
    ['PaymentStatus', shared.PAYMENT_STATUSES],
    ['TaskCategory', shared.TASK_CATEGORIES],
    ['TaskStatus', shared.TASK_STATUSES],
  ])('%s', (name, values) => {
    expect(values).toEqual(prismaEnum(name));
  });
});

// Swagger строит документацию из каждой входной схемы и падает, если не может.
describe('входные схемы конвертируются в OpenAPI', () => {
  const inputSchemas = Object.entries(shared).filter(
    ([name]) => /^(create|update)\w+Schema$|Query(Schema)?$/.test(name) && name.endsWith('Schema'),
  ) as [string, z.ZodType][];

  it('схем найдено достаточно', () => {
    expect(inputSchemas.length).toBeGreaterThanOrEqual(18);
  });

  it.each(inputSchemas)('%s', (_, schema) => {
    expect(() => schema['~standard'].jsonSchema.input({ target: 'openapi-3.0' })).not.toThrow();
  });
});

describe('update…Schema = create…Schema.partial()', () => {
  it('пустой PATCH ничего не подставляет', () => {
    expect(updateAssetSchema.parse({})).toEqual({});
    expect(updateTaskSchema.parse({})).toEqual({});
  });

  it('пустая строка из формы → null (очистить поле)', () => {
    expect(updateAssetSchema.parse({ warrantyUntil: '', price: '', notes: '  ' })).toEqual({
      warrantyUntil: null,
      price: null,
      notes: null,
    });
  });
});

describe('поля форм', () => {
  const expense = { title: ' Продукты ', amount: '1500', category: 'GROCERIES', date: '2026-12-01' };

  it('строки из формы приводятся к нужным типам', () => {
    expect(createExpenseSchema.parse(expense)).toEqual({
      title: 'Продукты',
      amount: 1500,
      category: 'GROCERIES',
      date: new Date('2026-12-01'),
    });
  });

  it.each([
    ['сумма 0', { amount: '0' }, 'Сумма должна быть больше 0'],
    ['дробная сумма', { amount: '10.5' }, 'Сумма — целое число рублей'],
    ['дата не ISO', { date: '01.12.2026' }, 'Некорректная дата'],
    ['пустое название', { title: '  ' }, 'Введите название'],
  ])('отклоняет: %s', (_, patch, message) => {
    const result = createExpenseSchema.safeParse({ ...expense, ...patch });
    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it('необязательные поля можно не присылать', () => {
    expect(createAssetSchema.parse({ name: 'Холодильник' })).toEqual({ name: 'Холодильник' });
    expect(createTaskSchema.parse({ title: 'Полить цветы', assigneeId: '' })).toEqual({
      title: 'Полить цветы',
      assigneeId: null,
    });
  });
});

describe('даты по Москве', () => {
  it('toDateKey: 21:30 UTC — уже следующий день в Москве', () => {
    expect(toDateKey('2026-11-30T21:30:00Z')).toBe('2026-12-01');
  });

  it('daysUntil считает календарные дни, а не 24-часовые интервалы', () => {
    const now = new Date('2026-12-01T20:00:00Z'); // 23:00 по Москве
    expect(daysUntil('2026-12-01T22:00:00Z', now)).toBe(1); // 01:00 следующего дня
    expect(daysUntil('2026-12-01T06:00:00Z', now)).toBe(0);
    expect(daysUntil('2026-11-30T12:00:00Z', now)).toBe(-1);
  });
});
