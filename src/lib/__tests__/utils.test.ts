import { describe, it, expect, vi, afterEach } from 'vitest'
import { cn, formatCurrency, formatNumber, formatDate, formatDateTime, getInitials, slugify, timeAgo, cleanJsonResponse } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats with MXN by default', () => {
    const result = formatCurrency(1234.5)
    expect(result).toContain('1,234.50')
    expect(result).toMatch(/\$/)
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0.00')
  })

  it('accepts a different currency', () => {
    const result = formatCurrency(100, 'USD')
    expect(result).toContain('100.00')
  })
})

describe('formatNumber', () => {
  it('formats thousands with comma separator', () => {
    expect(formatNumber(1234567)).toContain('1,234,567')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('formats decimals', () => {
    const result = formatNumber(1234.56)
    expect(result).toContain('1,234.56')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date(2025, 0, 15)) // Jan 15 2025
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2025/)
  })

  it('formats a string date', () => {
    const result = formatDate('2025-06-20')
    expect(result).toMatch(/2025/)
  })
})

describe('formatDateTime', () => {
  it('includes time components', () => {
    const result = formatDateTime(new Date(2025, 5, 15, 14, 30)) // Jun 15 2025 14:30
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2025/)
    // Should include hour/minute
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('getInitials', () => {
  it('returns first two initials', () => {
    expect(getInitials('Juan Pérez')).toBe('JP')
  })

  it('handles single name', () => {
    expect(getInitials('Admin')).toBe('A')
  })

  it('truncates to 2 chars for 3+ names', () => {
    expect(getInitials('Ana María López')).toBe('AM')
  })

  it('uppercases initials', () => {
    expect(getInitials('ana lópez')).toBe('AL')
  })
})

describe('slugify', () => {
  it('converts to lowercase and replaces spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips accents', () => {
    expect(slugify('Campaña Navideña')).toBe('campana-navidena')
  })

  it('removes special chars', () => {
    expect(slugify('¡Oferta! @50%')).toBe('oferta-50')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('a   b   c')).toBe('a-b-c')
  })
})

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function mockNow(iso: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(iso))
  }

  const BASE = '2025-06-15T12:00:00Z'

  it('retorna "Justo ahora" para menos de 1 minuto', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-06-15T11:59:45Z'))).toBe('Justo ahora')
  })

  it('retorna minutos para < 60 min', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-06-15T11:55:00Z'))).toBe('Hace 5 min')
  })

  it('retorna horas para < 24h', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-06-15T09:00:00Z'))).toBe('Hace 3h')
  })

  it('retorna días para < 7d', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-06-13T12:00:00Z'))).toBe('Hace 2d')
  })

  it('retorna semanas para < 30d', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-06-01T12:00:00Z'))).toBe('Hace 2 sem')
  })

  it('retorna meses (plural) para >= 2 meses', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-04-10T12:00:00Z'))).toBe('Hace 2 meses')
  })

  it('retorna mes (singular) para 1 mes', () => {
    mockNow(BASE)
    expect(timeAgo(new Date('2025-05-14T12:00:00Z'))).toBe('Hace 1 mes')
  })
})

describe('cleanJsonResponse', () => {
  it('strips ```json wrapper', () => {
    expect(cleanJsonResponse('```json\n{"a":1}\n```')).toBe('{"a":1}')
  })

  it('strips ``` wrapper without language tag', () => {
    expect(cleanJsonResponse('```\n[1,2,3]\n```')).toBe('[1,2,3]')
  })

  it('handles ```JSON (uppercase)', () => {
    expect(cleanJsonResponse('```JSON\n{"b":2}\n```')).toBe('{"b":2}')
  })

  it('returns clean JSON unchanged', () => {
    expect(cleanJsonResponse('{"clean":true}')).toBe('{"clean":true}')
  })

  it('trims whitespace around JSON', () => {
    expect(cleanJsonResponse('  {"spaced":true}  ')).toBe('{"spaced":true}')
  })

  it('extracts JSON object from surrounding text', () => {
    expect(cleanJsonResponse('Here is the result:\n{"key":"value"}\nDone!')).toBe('{"key":"value"}')
  })

  it('extracts JSON array from surrounding text', () => {
    expect(cleanJsonResponse('Sure, here you go:\n[{"a":1},{"b":2}]\nLet me know if you need more.')).toBe('[{"a":1},{"b":2}]')
  })

  it('handles nested JSON structures', () => {
    const nested = '{"outer":{"inner":[1,2,3]}}'
    expect(cleanJsonResponse(`Some text\n${nested}\nMore text`)).toBe(nested)
  })
})
