import { z } from 'zod'

export const updateParrillaSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.string().optional(),
})

export const updateEntrySchema = z.object({
  headline: z.string().max(200).optional(),
  primaryText: z.string().max(5000).optional(),
  description: z.string().max(1000).optional(),
  ctaText: z.string().max(100).optional(),
  hashtags: z.array(z.string()).optional(),
  visualConcept: z.string().max(2000).optional(),
  imagePrompt: z.string().max(4000).optional().nullable(),
  publishDate: z.string().datetime().optional(),
  publishTime: z.string().optional().nullable(),
  platform: z.string().optional(),
  contentType: z.string().optional(),
  objective: z.string().optional(),
  status: z.string().optional(),
})

export const createApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED']),
  comment: z.string().max(5000).optional().nullable(),
  entryId: z.string().optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Contenido es requerido').max(5000),
})

export const regenerateEntrySchema = z.object({
  what: z.enum(['copy', 'imagePrompt', 'videoScript', 'all']),
  instructions: z.string().max(2000).optional(),
})
