import { describe, it, expect } from 'vitest'
import { recommendContentMix } from '../budget-advisor'

describe('recommendContentMix', () => {
  it('budget 0 retorna mix basico organico', () => {
    const result = recommendContentMix(0, ['META_FEED'])
    expect(result.staticImages).toBe(4)
    expect(result.videos).toBe(2)
    expect(result.carousels).toBe(1)
    expect(result.stories).toBe(2)
    expect(result.reasoning).toContain('orgánico')
  })

  it('budget bajo (2000) con 1 plataforma retorna pocas piezas', () => {
    const result = recommendContentMix(2000, ['META_FEED'])
    expect(result.staticImages).toBeLessThanOrEqual(4)
    expect(result.videos).toBe(1)
    expect(result.carousels).toBe(0)
    expect(result.stories).toBe(1)
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('budget bajo (2000) con 2 plataformas tiene al menos 2 imagenes', () => {
    const result = recommendContentMix(2000, ['META_FEED', 'TIKTOK'])
    expect(result.staticImages).toBeGreaterThanOrEqual(2)
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('budget medio (10000) retorna mix moderado', () => {
    const result = recommendContentMix(10000, ['META_FEED'])
    expect(result.staticImages).toBeGreaterThanOrEqual(5)
    expect(result.videos).toBeGreaterThanOrEqual(3)
    expect(result.carousels).toBeGreaterThanOrEqual(1)
    expect(result.stories).toBeGreaterThanOrEqual(2)
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('budget alto (30000) con 3 plataformas retorna volumen agresivo', () => {
    const result = recommendContentMix(30000, ['META_FEED', 'TIKTOK', 'GOOGLE_DISPLAY'])
    expect(result.staticImages).toBeGreaterThanOrEqual(8)
    expect(result.videos).toBeGreaterThanOrEqual(5)
    expect(result.carousels).toBeGreaterThanOrEqual(2)
    expect(result.stories).toBeGreaterThanOrEqual(4)
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('todos los valores son numeros no negativos', () => {
    const budgets = [0, 1000, 5000, 10000, 25000, 50000]
    for (const b of budgets) {
      const result = recommendContentMix(b, ['META_FEED'])
      expect(result.staticImages).toBeGreaterThanOrEqual(0)
      expect(result.videos).toBeGreaterThanOrEqual(0)
      expect(result.carousels).toBeGreaterThanOrEqual(0)
      expect(result.stories).toBeGreaterThanOrEqual(0)
      expect(typeof result.reasoning).toBe('string')
      expect(result.reasoning.length).toBeGreaterThan(0)
    }
  })

  it('plataformas vacias usa platformCount 1', () => {
    const result = recommendContentMix(10000, [])
    expect(result.staticImages).toBeGreaterThanOrEqual(3)
  })
})
