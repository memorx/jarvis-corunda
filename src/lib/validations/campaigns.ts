import { z } from 'zod'

const platformEnum = z.enum([
  'META_FEED', 'META_STORIES', 'META_REELS',
  'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'GOOGLE_YOUTUBE',
  'TIKTOK', 'YOUTUBE_SHORTS', 'LINKEDIN', 'TWITTER_X',
])

const objectiveEnum = z.enum([
  'AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'CONVERSIONS', 'SALES',
])

export const createCampaignSchema = z.object({
  accountId: z.string().min(1, 'accountId es requerido'),
  name: z.string().min(1, 'Nombre es requerido').max(200),
  platform: platformEnum,
  objective: objectiveEnum,
  dailyBudget: z.number().positive().optional().nullable(),
  totalBudget: z.number().positive().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
})

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.string().optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
