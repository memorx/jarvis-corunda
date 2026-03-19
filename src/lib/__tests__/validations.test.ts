import { describe, it, expect } from 'vitest'
import {
  generateStrategySchema,
  generateParrillaSchema,
  createAccountSchema,
  createUserSchema,
} from '../validations'
import { validateBody } from '../validate'

describe('generateStrategySchema', () => {
  const validInput = {
    accountId: 'acc-1',
    month: 3,
    year: 2025,
    objectives: 'Aumentar awareness',
    isPaid: false,
  }

  it('parsea input válido sin errores', () => {
    const result = generateStrategySchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('falla sin accountId', () => {
    const result = generateStrategySchema.safeParse({ ...validInput, accountId: '' })
    expect(result.success).toBe(false)
  })

  it('falla con month: 0 (mínimo 1)', () => {
    const result = generateStrategySchema.safeParse({ ...validInput, month: 0 })
    expect(result.success).toBe(false)
  })

  it('falla con month: 13 (máximo 12)', () => {
    const result = generateStrategySchema.safeParse({ ...validInput, month: 13 })
    expect(result.success).toBe(false)
  })

  it('falla sin objectives', () => {
    const { objectives, ...noObj } = validInput
    const result = generateStrategySchema.safeParse(noObj)
    expect(result.success).toBe(false)
  })

  it('ignora campos extra (strip by default)', () => {
    const result = generateStrategySchema.safeParse({ ...validInput, extraField: 'hello' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as any).extraField).toBeUndefined()
    }
  })

  it('aplica default isPaid: false cuando no se provee', () => {
    const { isPaid, ...noPaid } = validInput
    const result = generateStrategySchema.safeParse(noPaid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isPaid).toBe(false)
    }
  })
})

describe('generateParrillaSchema', () => {
  const validInput = {
    accountId: 'acc-1',
    month: 6,
    year: 2025,
    objectives: 'Ventas de verano',
    platforms: ['META_FEED', 'TIKTOK'],
    contentMix: {
      staticImages: 4,
      videos: 2,
      carousels: 1,
      stories: 1,
    },
    isPaid: false,
  }

  it('parsea input válido completo', () => {
    const result = generateParrillaSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('falla con platforms vacío', () => {
    const result = generateParrillaSchema.safeParse({ ...validInput, platforms: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const platformError = result.error.issues.find(i => i.path.includes('platforms'))
      expect(platformError?.message).toContain('Al menos una plataforma')
    }
  })

  it('falla con contentMix con números negativos', () => {
    const result = generateParrillaSchema.safeParse({
      ...validInput,
      contentMix: { staticImages: -1, videos: 0, carousels: 0, stories: 0 },
    })
    expect(result.success).toBe(false)
  })

  it('falla sin contentMix', () => {
    const { contentMix, ...noMix } = validInput
    const result = generateParrillaSchema.safeParse(noMix)
    expect(result.success).toBe(false)
  })
})

describe('createAccountSchema', () => {
  const validInput = {
    name: 'Test Account',
    brandName: 'TestBrand',
  }

  it('parsea input válido', () => {
    const result = createAccountSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('falla sin name', () => {
    const result = createAccountSchema.safeParse({ brandName: 'X' })
    expect(result.success).toBe(false)
  })

  it('falla sin brandName', () => {
    const result = createAccountSchema.safeParse({ name: 'X' })
    expect(result.success).toBe(false)
  })

  it('falla con brandColors inválidos', () => {
    const result = createAccountSchema.safeParse({
      ...validInput,
      brandColors: ['invalid'],
    })
    expect(result.success).toBe(false)
  })

  it('acepta brandColors con hex válido', () => {
    const result = createAccountSchema.safeParse({
      ...validInput,
      brandColors: ['#FF0000', '#00ff00'],
    })
    expect(result.success).toBe(true)
  })

  it('aplica defaults para arrays opcionales', () => {
    const result = createAccountSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.brandColors).toEqual([])
      expect(result.data.platforms).toEqual([])
      expect(result.data.contentTypes).toEqual([])
    }
  })
})

describe('createUserSchema', () => {
  const validInput = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'securepass123',
  }

  it('parsea input válido', () => {
    const result = createUserSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('falla con email inválido', () => {
    const result = createUserSchema.safeParse({ ...validInput, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('falla con password corto (< 8 chars)', () => {
    const result = createUserSchema.safeParse({ ...validInput, password: 'short' })
    expect(result.success).toBe(false)
  })

  it('falla con role inválido', () => {
    const result = createUserSchema.safeParse({ ...validInput, role: 'INVALID_ROLE' })
    expect(result.success).toBe(false)
  })

  it('aplica default role COMMUNITY cuando no se provee', () => {
    const result = createUserSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('COMMUNITY')
    }
  })
})

describe('validateBody', () => {
  it('retorna success con data validada para input válido', () => {
    const result = validateBody(createUserSchema, {
      email: 'test@example.com',
      name: 'Test',
      password: 'securepass123',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
      expect(result.data.role).toBe('COMMUNITY')
    }
  })

  it('retorna error 400 con detalles para input inválido', async () => {
    const result = validateBody(createUserSchema, {
      email: 'bad',
      name: '',
      password: '123',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response.json()
      expect(result.response.status).toBe(400)
      expect(body.error).toBe('Datos inválidos')
      expect(body.details).toBeInstanceOf(Array)
      expect(body.details.length).toBeGreaterThan(0)
      expect(body.details[0]).toHaveProperty('field')
      expect(body.details[0]).toHaveProperty('message')
    }
  })
})
