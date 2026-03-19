import { NextResponse } from 'next/server'
import { auth } from './auth'
import { hasPermission } from './permissions'

interface AuthResult {
  success: true
  userId: string
  role: string
}

interface AuthError {
  success: false
  response: NextResponse
}

/**
 * Verifica autenticación y, opcionalmente, un permiso.
 * Uso en API routes:
 *
 *   const authCheck = await requireAuth('accounts:write')
 *   if (!authCheck.success) return authCheck.response
 *   // authCheck.userId y authCheck.role disponibles
 */
export async function requireAuth(permission?: string): Promise<AuthResult | AuthError> {
  const session = await auth()

  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    }
  }

  const role = (session.user as any).role as string
  const userId = session.user.id as string

  if (permission && !hasPermission(role, permission)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Sin permisos', required: permission, role },
        { status: 403 }
      ),
    }
  }

  return { success: true, userId, role }
}

/**
 * Verifica API key para rutas machine-to-machine (n8n webhooks).
 * Busca el header `x-api-key` y lo compara con N8N_API_SECRET.
 */
export function requireApiKey(request: Request): AuthError | { success: true } {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.N8N_API_SECRET

  if (!expectedKey) {
    console.warn('[Auth] N8N_API_SECRET not set — allowing request in dev mode')
    return { success: true }
  }

  if (!apiKey || apiKey !== expectedKey) {
    return {
      success: false,
      response: NextResponse.json({ error: 'API key inválida' }, { status: 401 }),
    }
  }

  return { success: true }
}
