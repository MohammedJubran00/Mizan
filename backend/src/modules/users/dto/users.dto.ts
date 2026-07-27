import { z } from 'zod';

export const listMembersSchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'LAWYER', 'ASSISTANT', 'MEMBER', 'ALL']).default('ALL'),
  isActive: z.enum(['true', 'false', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateMemberSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'LAWYER', 'ASSISTANT', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().trim().max(50).optional().nullable(),
  department: z.string().trim().max(100).optional().nullable(),
  jobTitle: z.string().trim().max(100).optional().nullable(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(1).max(200),
  role: z.enum(['ADMIN', 'LAWYER', 'ASSISTANT', 'MEMBER']).default('MEMBER'),
  jobTitle: z.string().trim().max(100).optional().nullable(),
  department: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
});

export type ListMembersQuery = z.infer<typeof listMembersSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
