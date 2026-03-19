/**
 * Smoke tests — verify every module can be imported without crashing.
 * This catches syntax errors, missing dependencies, and broken re-exports
 * at the import level before any runtime logic runs.
 */
import { describe, it, expect } from 'vitest'

// ─── Lib modules ─────────────────────────────────────
describe('Smoke: lib modules', () => {
  it('imports @/lib/permissions', async () => {
    await expect(import('@/lib/permissions')).resolves.toBeDefined()
  })

  it('imports @/lib/constants', async () => {
    await expect(import('@/lib/constants')).resolves.toBeDefined()
  })

  it('imports @/lib/utils', async () => {
    await expect(import('@/lib/utils')).resolves.toBeDefined()
  })

  it('imports @/lib/validate', async () => {
    await expect(import('@/lib/validate')).resolves.toBeDefined()
  })

  it('imports @/lib/validations', async () => {
    await expect(import('@/lib/validations')).resolves.toBeDefined()
  })

  it('imports @/lib/validations/accounts', async () => {
    await expect(import('@/lib/validations/accounts')).resolves.toBeDefined()
  })

  it('imports @/lib/validations/campaigns', async () => {
    await expect(import('@/lib/validations/campaigns')).resolves.toBeDefined()
  })

  it('imports @/lib/validations/ai', async () => {
    await expect(import('@/lib/validations/ai')).resolves.toBeDefined()
  })

  it('imports @/lib/validations/parrillas', async () => {
    await expect(import('@/lib/validations/parrillas')).resolves.toBeDefined()
  })

  it('imports @/lib/validations/users', async () => {
    await expect(import('@/lib/validations/users')).resolves.toBeDefined()
  })

  it('imports @/lib/validations/n8n', async () => {
    await expect(import('@/lib/validations/n8n')).resolves.toBeDefined()
  })

  // auth-helpers is omitted — imports next-auth which requires next/server (tested separately)

  it('imports @/lib/n8n', async () => {
    await expect(import('@/lib/n8n')).resolves.toBeDefined()
  })
})

// ─── AI lib modules ──────────────────────────────────
// AI generators are omitted — they instantiate Anthropic SDK at module level
// which throws in happy-dom (browser-like). They're tested with mocks in lib/ai/__tests__/.
describe('Smoke: AI prompts', () => {
  it('imports @/lib/ai/prompts/copywriter', async () => {
    await expect(import('@/lib/ai/prompts/copywriter')).resolves.toBeDefined()
  })

  it('imports @/lib/ai/prompts/strategy', async () => {
    await expect(import('@/lib/ai/prompts/strategy')).resolves.toBeDefined()
  })

  it('imports @/lib/ai/prompts/image-director', async () => {
    await expect(import('@/lib/ai/prompts/image-director')).resolves.toBeDefined()
  })

  it('imports @/lib/ai/prompts/video-director', async () => {
    await expect(import('@/lib/ai/prompts/video-director')).resolves.toBeDefined()
  })
})

// NOTE: API route smoke tests are omitted because they transitively import
// `next-auth` which requires `next/server` — unavailable in Vitest.
// Route imports are already validated by the API integration tests.

// ─── Component modules ───────────────────────────────
describe('Smoke: components', () => {
  it('imports components/ui/button', async () => {
    await expect(import('@/components/ui/button')).resolves.toBeDefined()
  })

  it('imports components/ui/card', async () => {
    await expect(import('@/components/ui/card')).resolves.toBeDefined()
  })

  it('imports components/ui/input', async () => {
    await expect(import('@/components/ui/input')).resolves.toBeDefined()
  })

  it('imports components/ui/badge', async () => {
    await expect(import('@/components/ui/badge')).resolves.toBeDefined()
  })

  it('imports components/ui/modal', async () => {
    await expect(import('@/components/ui/modal')).resolves.toBeDefined()
  })

  it('imports components/ui/select', async () => {
    await expect(import('@/components/ui/select')).resolves.toBeDefined()
  })

  it('imports components/ui/skeleton', async () => {
    await expect(import('@/components/ui/skeleton')).resolves.toBeDefined()
  })

  it('imports components/ui/textarea', async () => {
    await expect(import('@/components/ui/textarea')).resolves.toBeDefined()
  })

  it('imports components/ui/toast', async () => {
    await expect(import('@/components/ui/toast')).resolves.toBeDefined()
  })

  it('imports components/ui/avatar', async () => {
    await expect(import('@/components/ui/avatar')).resolves.toBeDefined()
  })

  it('imports components/ui/file-upload', async () => {
    await expect(import('@/components/ui/file-upload')).resolves.toBeDefined()
  })
})
