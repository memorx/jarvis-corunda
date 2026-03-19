import { describe, it, expect } from 'vitest'
import { PLATFORM_SPECS, IMAGE_DIMENSIONS, ROLE_PERMISSIONS, PLATFORM_LABELS } from '../constants'

describe('PLATFORM_SPECS', () => {
  it('contains META_FEED with required fields', () => {
    expect(PLATFORM_SPECS.META_FEED).toBeDefined()
    expect(PLATFORM_SPECS.META_FEED.headline).toBeTypeOf('number')
    expect(PLATFORM_SPECS.META_FEED.primaryText).toBeTypeOf('number')
    expect(PLATFORM_SPECS.META_FEED.ctas).toBeInstanceOf(Array)
    expect(PLATFORM_SPECS.META_FEED.ctas.length).toBeGreaterThan(0)
  })

  it('contains GOOGLE_SEARCH with nested headline specs', () => {
    expect(PLATFORM_SPECS.GOOGLE_SEARCH).toBeDefined()
    expect(PLATFORM_SPECS.GOOGLE_SEARCH.headlines.count).toBeTypeOf('number')
    expect(PLATFORM_SPECS.GOOGLE_SEARCH.headlines.maxChars).toBeTypeOf('number')
  })

  it('all char limits are positive numbers', () => {
    for (const [, spec] of Object.entries(PLATFORM_SPECS)) {
      for (const [key, val] of Object.entries(spec)) {
        if (typeof val === 'number') {
          expect(val, `${key} should be positive`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('has specs for every expected platform', () => {
    const expected = ['META_FEED', 'META_STORIES', 'META_REELS', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'TIKTOK', 'YOUTUBE_SHORTS', 'LINKEDIN']
    for (const p of expected) {
      expect(PLATFORM_SPECS).toHaveProperty(p)
    }
  })
})

describe('IMAGE_DIMENSIONS', () => {
  it('every entry has width, height, ratio, and label', () => {
    for (const [, dims] of Object.entries(IMAGE_DIMENSIONS)) {
      for (const dim of dims) {
        expect(dim.width).toBeTypeOf('number')
        expect(dim.height).toBeTypeOf('number')
        expect(dim.ratio).toBeTypeOf('string')
        expect(dim.label).toBeTypeOf('string')
      }
    }
  })

  it('widths and heights are positive', () => {
    for (const [, dims] of Object.entries(IMAGE_DIMENSIONS)) {
      for (const dim of dims) {
        expect(dim.width).toBeGreaterThan(0)
        expect(dim.height).toBeGreaterThan(0)
      }
    }
  })

  it('has dimensions for META_FEED', () => {
    expect(IMAGE_DIMENSIONS.META_FEED.length).toBeGreaterThanOrEqual(1)
  })
})

describe('ROLE_PERMISSIONS', () => {
  it('SUPERADMIN has wildcard permission', () => {
    expect(ROLE_PERMISSIONS.SUPERADMIN).toContain('*')
  })

  it('CLIENT has limited permissions', () => {
    expect(ROLE_PERMISSIONS.CLIENT).not.toContain('*')
    expect(ROLE_PERMISSIONS.CLIENT.length).toBeGreaterThan(0)
  })

  it('every role has at least one permission', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      expect(perms.length, `${role} should have permissions`).toBeGreaterThan(0)
    }
  })

  it('MANAGER has account and parrilla permissions', () => {
    expect(ROLE_PERMISSIONS.MANAGER.some(p => p.startsWith('accounts:'))).toBe(true)
    expect(ROLE_PERMISSIONS.MANAGER.some(p => p.startsWith('parrillas:'))).toBe(true)
  })

  it('COMMUNITY incluye parrillas:read', () => {
    expect(ROLE_PERMISSIONS.COMMUNITY).toContain('parrillas:read')
  })

  it('CLIENT tiene parrillas:read:own (con :own)', () => {
    expect(ROLE_PERMISSIONS.CLIENT).toContain('parrillas:read:own')
  })
})

describe('PLATFORM_LABELS', () => {
  it('has a human-readable label for each platform key', () => {
    for (const [key, label] of Object.entries(PLATFORM_LABELS)) {
      expect(key).toMatch(/^[A-Z_]+$/)
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('maps META_FEED to Meta Feed', () => {
    expect(PLATFORM_LABELS.META_FEED).toBe('Meta Feed')
  })

  it('maps TIKTOK to TikTok', () => {
    expect(PLATFORM_LABELS.TIKTOK).toBe('TikTok')
  })
})
