import { z } from 'zod'

export const generateStrategySchema = z.object({
  accountId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2030),
  objectives: z.string().min(1, 'Objetivos son requeridos').max(5000),
  specialInstructions: z.string().max(5000).optional(),
  promotions: z.string().max(5000).optional(),
  isPaid: z.boolean().optional().default(false),
})

export const generateCopySchema = z.object({
  accountId: z.string().min(1),
  platform: z.string().min(1),
  contentType: z.string().min(1),
  objective: z.string().min(1),
  concept: z.string().min(1).max(2000),
  hookType: z.string().optional(),
  strategy: z.any().optional(),
  parrillaId: z.string().optional(),
  entryId: z.string().optional(),
})

export const generateImagePromptSchema = z.object({
  accountId: z.string().min(1),
  visualConcept: z.string().min(1).max(2000),
  platform: z.string().min(1),
  aspectRatio: z.string().min(1),
  style: z.string().optional(),
  parrillaId: z.string().optional(),
  entryId: z.string().optional(),
})

export const generateImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  size: z.enum(['1024x1024', '1024x1792', '1792x1024']).optional().default('1024x1024'),
  quality: z.enum(['standard', 'hd']).optional().default('hd'),
  accountId: z.string().optional(),
  parrillaId: z.string().optional(),
  entryId: z.string().optional(),
})

export const generateVideoScriptSchema = z.object({
  accountId: z.string().min(1),
  concept: z.string().min(1).max(2000),
  platform: z.string().min(1),
  duration: z.string().optional().default('30s'),
  objective: z.string().min(1),
  strategy: z.any().optional(),
  parrillaId: z.string().optional(),
  entryId: z.string().optional(),
})

export const generateParrillaSchema = z.object({
  accountId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2030),
  objectives: z.string().min(1).max(5000),
  platforms: z.array(z.string()).min(1, 'Al menos una plataforma es requerida'),
  contentMix: z.object({
    staticImages: z.number().int().min(0).default(0),
    videos: z.number().int().min(0).default(0),
    carousels: z.number().int().min(0).default(0),
    stories: z.number().int().min(0).default(0),
  }),
  isPaid: z.boolean().optional().default(false),
  specialInstructions: z.string().max(5000).optional(),
  promotions: z.string().max(5000).optional(),
  budget: z.number().positive().optional(),
})
