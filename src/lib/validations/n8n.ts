import { z } from 'zod'

export const campaignMetricsSchema = z.object({
  campaignId: z.string().min(1, 'campaignId es requerido'),
  date: z.string().min(1, 'date es requerida'),
  impressions: z.number().min(0).optional().default(0),
  clicks: z.number().min(0).optional().default(0),
  spend: z.number().min(0).optional().default(0),
  conversions: z.number().min(0).optional().default(0),
  leads: z.number().min(0).optional().default(0),
  reach: z.number().min(0).optional().default(0),
})

export const publishResultSchema = z.object({
  entryId: z.string().min(1, 'entryId es requerido'),
  platform: z.string().optional(),
  externalPostId: z.string().optional(),
  publishedUrl: z.string().url().optional(),
  success: z.boolean(),
})

export const campaignAlertSchema = z.object({
  campaignId: z.string().optional(),
  alertType: z.string().optional(),
  message: z.string().optional(),
  threshold: z.number().optional(),
  currentValue: z.number().optional(),
})
