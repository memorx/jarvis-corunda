import { NextResponse } from 'next/server'
import type { ZodSchema, ZodError } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = (result.error as ZodError).issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }))
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Datos inválidos', details: errors },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}
