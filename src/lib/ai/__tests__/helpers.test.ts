import { describe, it, expect, vi } from 'vitest'

// Mock SDK clients that instantiate at module level
vi.mock('@anthropic-ai/sdk', () => ({ default: vi.fn() }))
vi.mock('openai', () => ({ default: vi.fn() }))
vi.mock('@/lib/db', () => ({ default: {} }))

import { getCharLimits } from '../copy-generator'
import { mapAspectRatioToSize } from '../image-generator'
import { getMonthName, getDefaultAspectRatio } from '../parrilla-generator'

describe('getCharLimits', () => {
  it('returns correct limits for META_FEED', () => {
    const limits = getCharLimits('META_FEED')
    expect(limits.headline).toBe(40)
    expect(limits.primaryText).toBe(125)
    expect(limits.description).toBe(30)
  })

  it('returns correct limits for LINKEDIN', () => {
    const limits = getCharLimits('LINKEDIN')
    expect(limits.headline).toBe(70)
    expect(limits.primaryText).toBe(150)
    expect(limits.description).toBe(100)
  })

  it('returns correct limits for TIKTOK (maps adText to primaryText)', () => {
    const limits = getCharLimits('TIKTOK')
    expect(limits.primaryText).toBe(100)
  })

  it('returns correct limits for GOOGLE_DISPLAY (maps shortHeadline to headline)', () => {
    const limits = getCharLimits('GOOGLE_DISPLAY')
    expect(limits.headline).toBe(25)
    expect(limits.longHeadline).toBe(90)
    expect(limits.description).toBe(90)
  })

  it('returns correct limits for YOUTUBE_SHORTS (maps title to headline)', () => {
    const limits = getCharLimits('YOUTUBE_SHORTS')
    expect(limits.headline).toBe(100)
  })

  it('returns defaults for unknown platform', () => {
    const limits = getCharLimits('UNKNOWN_PLATFORM')
    expect(limits).toEqual({ headline: 60, primaryText: 200, description: 100 })
  })

  it('returns defaults for META_STORIES (no standard text fields)', () => {
    const limits = getCharLimits('META_STORIES')
    expect(limits.textOverlay).toBe(50)
  })
})

describe('mapAspectRatioToSize', () => {
  it('maps 9:16 to portrait', () => {
    expect(mapAspectRatioToSize('9:16')).toBe('1024x1792')
  })

  it('maps 4:5 to portrait', () => {
    expect(mapAspectRatioToSize('4:5')).toBe('1024x1792')
  })

  it('maps 4:15 to portrait', () => {
    expect(mapAspectRatioToSize('4:15')).toBe('1024x1792')
  })

  it('maps 16:9 to landscape', () => {
    expect(mapAspectRatioToSize('16:9')).toBe('1792x1024')
  })

  it('maps 1.91:1 to landscape', () => {
    expect(mapAspectRatioToSize('1.91:1')).toBe('1792x1024')
  })

  it('defaults to square for 1:1', () => {
    expect(mapAspectRatioToSize('1:1')).toBe('1024x1024')
  })

  it('defaults to square for unknown ratio', () => {
    expect(mapAspectRatioToSize('3:2')).toBe('1024x1024')
  })
})

describe('getMonthName', () => {
  it('returns Enero for month 1', () => {
    expect(getMonthName(1)).toBe('Enero')
  })

  it('returns Diciembre for month 12', () => {
    expect(getMonthName(12)).toBe('Diciembre')
  })

  it('returns Junio for month 6', () => {
    expect(getMonthName(6)).toBe('Junio')
  })

  it('returns empty string for out-of-range month', () => {
    expect(getMonthName(0)).toBe('')
    expect(getMonthName(13)).toBe('')
  })
})

describe('getDefaultAspectRatio', () => {
  it('returns 1:1 for META_FEED', () => {
    expect(getDefaultAspectRatio('META_FEED')).toBe('1:1')
  })

  it('returns 9:16 for META_STORIES', () => {
    expect(getDefaultAspectRatio('META_STORIES')).toBe('9:16')
  })

  it('returns 9:16 for TIKTOK', () => {
    expect(getDefaultAspectRatio('TIKTOK')).toBe('9:16')
  })

  it('returns 16:9 for GOOGLE_YOUTUBE', () => {
    expect(getDefaultAspectRatio('GOOGLE_YOUTUBE')).toBe('16:9')
  })

  it('returns 1.91:1 for LINKEDIN', () => {
    expect(getDefaultAspectRatio('LINKEDIN')).toBe('1.91:1')
  })

  it('defaults to 1:1 for unknown platform', () => {
    expect(getDefaultAspectRatio('UNKNOWN')).toBe('1:1')
  })
})
