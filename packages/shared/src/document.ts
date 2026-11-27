import { z } from 'zod';
import { isoDateTime, nullableIsoDateTime, optionalDateInput, optionalId, requiredText, searchQuery } from './common.js';

export const DOCUMENT_TYPES = ['RECEIPT', 'WARRANTY', 'MANUAL', 'CONTRACT', 'OTHER'] as const;
export const documentTypeSchema = z.enum(DOCUMENT_TYPES);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  RECEIPT: 'Чек',
  WARRANTY: 'Гарантийный талон',
  MANUAL: 'Инструкция',
  CONTRACT: 'Договор',
  OTHER: 'Другое',
};

// Ограничения загрузки: больше → 413 FILE_TOO_LARGE, другой тип → 415 UNSUPPORTED_FILE.
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

// POST …/documents — поля multipart рядом с файлом (все приходят строками).
export const createDocumentSchema = z.object({
  title: requiredText(120, 'Введите название'),
  type: documentTypeSchema.optional(),
  documentDate: optionalDateInput,
  assetId: optionalId,
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

// PATCH …/documents/:id — только метаданные, файл не меняется.
export const updateDocumentSchema = createDocumentSchema.partial();
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// GET …/documents?search&type&assetId
export const documentsQuerySchema = z.object({
  search: searchQuery,
  type: documentTypeSchema.optional(),
  assetId: z.string().optional(),
});
export type DocumentsQuery = z.infer<typeof documentsQuerySchema>;

// fileKey (путь в хранилище) наружу не отдаём; файл — через GET …/documents/:id/file.
export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: documentTypeSchema,
  documentDate: nullableIsoDateTime,
  assetId: z.string().nullable(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  createdAt: isoDateTime,
});
export type DocumentDto = z.infer<typeof documentSchema>;
