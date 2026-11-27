import { z } from 'zod';

// Роли участника дома. Значения совпадают с enum MemberRole в schema.prisma.
export const MEMBER_ROLES = ['OWNER', 'MEMBER'] as const;
export const memberRoleSchema = z.enum(MEMBER_ROLES);
export type MemberRole = z.infer<typeof memberRoleSchema>;

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Владелец',
  MEMBER: 'Участник',
};

// Дом в списке домов пользователя (GET /api/auth/me, переключатель в шапке).
export const householdSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  role: memberRoleSchema,
});
export type HouseholdSummaryDto = z.infer<typeof householdSummarySchema>;

// GET /api/households/:hid/members (селект «Исполнитель» в задачах).
export const memberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: memberRoleSchema,
});
export type MemberDto = z.infer<typeof memberSchema>;
