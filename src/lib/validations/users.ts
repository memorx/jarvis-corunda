import { z } from 'zod'

const roleEnum = z.enum([
  'SUPERADMIN', 'MANAGER', 'COMMUNITY', 'TRAFFIC', 'DESIGNER', 'PRODUCER', 'CLIENT',
])

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nombre es requerido').max(200),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: roleEnum.optional().default('COMMUNITY'),
})

export const assignUserToAccountSchema = z.object({
  userId: z.string().min(1),
  role: z.string().optional().default('support'),
})
