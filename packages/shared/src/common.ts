import { z } from 'zod';

// Общие кирпичики для схем сущностей.
//
// Два правила, на которых легко споткнуться:
// 1. Даты принимаем ISO-строкой и превращаем в Date через transform.
//    z.coerce.date() нельзя: Date не описывается в JSON Schema, и Swagger
//    падает при старте API.
// 2. В create…Schema нет .default(): update…Schema = create…Schema.partial(),
//    и default подставился бы в PATCH, молча перезаписав поле.
//    Значения по умолчанию ставит Prisma (@default в schema.prisma).

// Postgres Int — до 2 147 483 647; с запасом ограничиваем суммы.
export const MAX_AMOUNT = 100_000_000;

const DATE_ERROR = 'Некорректная дата';

// '2026-12-01' (так отдаёт <input type="date">) или '2026-12-01T10:00:00Z'
const isoDateString = z.union([z.iso.date(), z.iso.datetime({ offset: true })], {
  error: DATE_ERROR,
});

// Пустая строка из формы = «не заполнено» → null (в PATCH null = «очистить поле»).
const emptyToNull = <T>(value: T): Exclude<T, ''> | null =>
  value === '' ? null : (value as Exclude<T, ''>);

export const requiredText = (max: number, emptyMessage: string) =>
  z.string().trim().min(1, emptyMessage).max(max, `Не длиннее ${max} символов`);

export const optionalText = (max: number) =>
  z.string().trim().max(max, `Не длиннее ${max} символов`).nullish().transform(emptyToNull);

export const dateInput = isoDateString.transform((value) => new Date(value));

export const optionalDateInput = z
  .union([z.literal(''), isoDateString], { error: DATE_ERROR })
  .nullish()
  .transform((value) => (value ? new Date(value) : emptyToNull(value)));

// Сумма в рублях. coerce: из формы и query число приходит строкой.
export const amountInput = z.coerce
  .number({ error: 'Введите сумму' })
  .int('Сумма — целое число рублей')
  .positive('Сумма должна быть больше 0')
  .max(MAX_AMOUNT, 'Слишком большая сумма');

export const optionalPriceInput = z
  .union([
    z.literal(''),
    z.coerce.number().int('Цена — целое число рублей').min(0, 'Цена не может быть меньше 0').max(MAX_AMOUNT, 'Слишком большая цена'),
  ])
  .nullish()
  .transform(emptyToNull);

// Ссылка на другую запись (assetId, assigneeId): '' из селекта «не выбрано» → null.
export const optionalId = z.string().trim().nullish().transform(emptyToNull);

export const searchQuery = z.string().trim().max(100).optional();

// Даты в ответах API: Nest сериализует Date в ISO-строку.
export const isoDateTime = z.iso.datetime();
export const nullableIsoDateTime = isoDateTime.nullable();
