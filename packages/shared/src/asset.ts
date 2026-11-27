import { z } from 'zod';
import {
  isoDateTime,
  nullableIsoDateTime,
  optionalDateInput,
  optionalPriceInput,
  optionalText,
  requiredText,
  searchQuery,
} from './common.js';
import { documentSchema } from './document.js';
import { taskSchema } from './task.js';
import { warrantyStatusSchema } from './warranty.js';

export const ASSET_CATEGORIES = ['KITCHEN', 'APPLIANCE', 'ELECTRONICS', 'FURNITURE', 'OTHER'] as const;
export const assetCategorySchema = z.enum(ASSET_CATEGORIES);
export type AssetCategory = z.infer<typeof assetCategorySchema>;

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  KITCHEN: 'Кухня',
  APPLIANCE: 'Бытовая техника',
  ELECTRONICS: 'Электроника',
  FURNITURE: 'Мебель',
  OTHER: 'Другое',
};

export const createAssetSchema = z.object({
  name: requiredText(120, 'Введите название'),
  category: assetCategorySchema.optional(),
  manufacturer: optionalText(120),
  model: optionalText(120),
  price: optionalPriceInput,
  purchaseDate: optionalDateInput,
  warrantyUntil: optionalDateInput,
  serialNumber: optionalText(120),
  notes: optionalText(2000),
  lastServiceAt: optionalDateInput,
  nextServiceAt: optionalDateInput,
});
export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = createAssetSchema.partial();
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

// GET …/assets?search&category
export const assetsQuerySchema = z.object({
  search: searchQuery,
  category: assetCategorySchema.optional(),
});
export type AssetsQuery = z.infer<typeof assetsQuerySchema>;

// warrantyStatus в БД нет: сервис считает его через getWarrantyStatus(warrantyUntil).
export const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: assetCategorySchema,
  manufacturer: z.string().nullable(),
  model: z.string().nullable(),
  price: z.number().int().nullable(),
  purchaseDate: nullableIsoDateTime,
  warrantyUntil: nullableIsoDateTime,
  warrantyStatus: warrantyStatusSchema,
  serialNumber: z.string().nullable(),
  notes: z.string().nullable(),
  lastServiceAt: nullableIsoDateTime,
  nextServiceAt: nullableIsoDateTime,
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});
export type AssetDto = z.infer<typeof assetSchema>;

// GET …/assets/:id — карточка с привязанными документами и задачами.
export const assetDetailsSchema = assetSchema.extend({
  documents: z.array(documentSchema),
  tasks: z.array(taskSchema),
});
export type AssetDetailsDto = z.infer<typeof assetDetailsSchema>;
