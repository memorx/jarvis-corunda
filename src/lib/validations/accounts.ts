import { z } from 'zod'

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(200),
  brandName: z.string().min(1, 'Nombre de marca es requerido').max(200),
  industry: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  brandVoice: z.string().max(5000).optional().nullable(),
  brandColors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido')).optional().default([]),
  targetAudience: z.string().max(5000).optional().nullable(),
  competitors: z.string().max(5000).optional().nullable(),
  guidelines: z.string().max(10000).optional().nullable(),
  sampleCopies: z.string().max(10000).optional().nullable(),
  platforms: z.array(z.string()).optional().default([]),
  contentTypes: z.array(z.string()).optional().default([]),
  monthlyBudget: z.number().positive().optional().nullable(),
})

export const updateAccountSchema = createAccountSchema.partial().extend({
  metaPageId: z.string().optional().nullable(),
  metaAdAccountId: z.string().optional().nullable(),
  googleAdsId: z.string().optional().nullable(),
  tiktokAdAccountId: z.string().optional().nullable(),
  linkedinPageId: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
  instagramUrl: z.string().url().optional().nullable().or(z.literal('')),
  facebookUrl: z.string().url().optional().nullable().or(z.literal('')),
  tiktokUrl: z.string().url().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal('')),
  painPoints: z.string().max(5000).optional().nullable(),
  differentiators: z.string().max(5000).optional().nullable(),
  productInfo: z.string().max(5000).optional().nullable(),
  priceRange: z.string().max(200).optional().nullable(),
  salesProcess: z.string().max(2000).optional().nullable(),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
