import { vi } from 'vitest'
import { auth } from '@/lib/auth'

const mockAuth = vi.mocked(auth)

/**
 * Creates a mock NextAuth session object.
 */
export function mockSession(role: string, userId = 'test-user-id') {
  return {
    user: { id: userId, role, name: 'Test User', email: 'test@test.com' },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}

/**
 * Mocks `auth()` from `@/lib/auth` to return a session with the given role.
 */
export function mockAuthSuccess(role: string, userId = 'test-user-id') {
  mockAuth.mockResolvedValue(mockSession(role, userId) as any)
}

/**
 * Mocks `auth()` to return null (unauthenticated).
 */
export function mockAuthNone() {
  mockAuth.mockResolvedValue(null as any)
}

/**
 * Creates a Request object suitable for Next.js route handlers.
 */
export function createMockRequest(
  method: string,
  body?: unknown,
  options?: {
    headers?: Record<string, string>
    url?: string
    searchParams?: Record<string, string>
  }
) {
  let url = options?.url || 'http://localhost:3000/api/test'
  if (options?.searchParams) {
    const params = new URLSearchParams(options.searchParams)
    url += `?${params.toString()}`
  }

  const init: RequestInit = { method }
  const headers: Record<string, string> = { ...options?.headers }

  if (body !== undefined) {
    init.body = JSON.stringify(body)
    headers['content-type'] = 'application/json'
  }

  init.headers = headers
  return new Request(url, init)
}

/**
 * Extracts JSON body and status from a NextResponse.
 */
export async function parseResponse(response: Response) {
  const status = response.status
  const data = await response.json()
  return { status, data }
}
