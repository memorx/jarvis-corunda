import { describe, it, expect } from 'vitest'
import { getStrategySystemPrompt, getStrategyUserPrompt } from '../prompts/strategy'
import { getCopywriterSystemPrompt, getCopyUserPrompt } from '../prompts/copywriter'
import { getImageDirectorSystemPrompt, getImageDirectorUserPrompt } from '../prompts/image-director'
import { getVideoDirectorSystemPrompt, getVideoDirectorUserPrompt } from '../prompts/video-director'

describe('Strategy prompts', () => {
  const brandContext = {
    brandName: 'TestBrand',
    industry: 'Tech',
    brandVoice: 'Profesional',
    targetAudience: 'Millennials',
    competitors: 'CompA, CompB',
    guidelines: 'No usar rojo',
    sampleCopies: 'Copy de ejemplo',
    brandColors: ['#FF0000', '#00FF00'],
  }

  describe('getStrategySystemPrompt', () => {
    it('includes brand name', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('TestBrand')
    })

    it('includes brand colors', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('#FF0000')
      expect(result).toContain('#00FF00')
    })

    it('includes industry', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('Tech')
    })

    it('uses fallbacks for null fields', () => {
      const result = getStrategySystemPrompt({
        brandName: 'Minimal',
        brandColors: [],
      })
      expect(result).toContain('Minimal')
      expect(result).toContain('No especificada')
      expect(result).toContain('No definida')
    })

    it('returns a string containing JSON format instructions', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('creative_concept')
      expect(result).toContain('JSON')
    })

    it('con painPoints incluye "Puntos de dolor"', () => {
      const result = getStrategySystemPrompt({
        ...brandContext,
        painPoints: 'No encuentran donde comprar en Morelia',
      })
      expect(result).toContain('Puntos de dolor')
      expect(result).toContain('No encuentran donde comprar en Morelia')
    })

    it('con productInfo incluye "Producto/Servicio"', () => {
      const result = getStrategySystemPrompt({
        ...brandContext,
        productInfo: 'Cursos de cocina online',
      })
      expect(result).toContain('Producto/Servicio')
      expect(result).toContain('Cursos de cocina online')
    })

    it('contiene regla de no recomendar campanas de Reconocimiento', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('NUNCA recomiendes campañas de Reconocimiento')
    })

    it('contiene ROAS y Advantage+', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('ROAS')
      expect(result).toContain('Advantage+')
    })

    it('contiene regla de rotar creativos', () => {
      const result = getStrategySystemPrompt(brandContext)
      expect(result).toContain('Rotar creativos')
    })

    it('sin campos nuevos (null) no crashea ni incluye lineas rotas', () => {
      const result = getStrategySystemPrompt({
        brandName: 'Simple',
        brandColors: [],
        painPoints: null,
        differentiators: null,
        productInfo: null,
        priceRange: null,
        salesProcess: null,
        websiteUrl: null,
      })
      expect(result).toContain('Simple')
      expect(result).not.toContain('undefined')
    })
  })

  describe('getStrategyUserPrompt', () => {
    it('includes month name and year', () => {
      const result = getStrategyUserPrompt({
        month: 3,
        year: 2025,
        objectives: 'Aumentar awareness',
        isPaid: false,
      })
      expect(result).toContain('Marzo')
      expect(result).toContain('2025')
    })

    it('includes objectives', () => {
      const result = getStrategyUserPrompt({
        month: 1,
        year: 2025,
        objectives: 'Generar leads',
        isPaid: true,
      })
      expect(result).toContain('Generar leads')
    })

    it('indicates paid campaigns', () => {
      const result = getStrategyUserPrompt({
        month: 6,
        year: 2025,
        objectives: 'Ventas',
        isPaid: true,
      })
      expect(result).toContain('pagadas')
    })

    it('includes optional promotions when provided', () => {
      const result = getStrategyUserPrompt({
        month: 12,
        year: 2025,
        objectives: 'Ventas navideñas',
        isPaid: false,
        promotions: '2x1 en todo',
      })
      expect(result).toContain('2x1 en todo')
    })

    it('includes optional special instructions when provided', () => {
      const result = getStrategyUserPrompt({
        month: 1,
        year: 2025,
        objectives: 'Test',
        isPaid: false,
        specialInstructions: 'Enfocarse en Gen Z',
      })
      expect(result).toContain('Enfocarse en Gen Z')
    })
  })
})

describe('Copywriter prompts', () => {
  describe('getCopywriterSystemPrompt', () => {
    it('includes brand name', () => {
      const result = getCopywriterSystemPrompt({ brandName: 'MiMarca' })
      expect(result).toContain('MiMarca')
    })

    it('uses default values for missing fields', () => {
      const result = getCopywriterSystemPrompt({ brandName: 'X' })
      expect(result).toContain('Profesional pero cercano')
      expect(result).toContain('Público general')
    })

    it('includes sample copies when provided', () => {
      const result = getCopywriterSystemPrompt({
        brandName: 'X',
        sampleCopies: 'Ejemplo de copy',
      })
      expect(result).toContain('Ejemplo de copy')
    })

    it('mentions JSON response format', () => {
      const result = getCopywriterSystemPrompt({ brandName: 'X' })
      expect(result).toContain('JSON')
    })

    it('con painPoints incluye el texto en el prompt', () => {
      const result = getCopywriterSystemPrompt({
        brandName: 'X',
        painPoints: 'El cliente no duerme bien',
      })
      expect(result).toContain('El cliente no duerme bien')
    })

    it('contiene tecnica de Hook en las primeras 5 palabras', () => {
      const result = getCopywriterSystemPrompt({ brandName: 'X' })
      expect(result).toContain('Hook en las primeras 5 palabras')
    })
  })

  describe('getCopyUserPrompt', () => {
    it('includes all input fields', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'engagement',
        concept: 'Promo verano',
        charLimits: { headline: 40, primaryText: 125 },
      })
      expect(result).toContain('META_FEED')
      expect(result).toContain('STATIC_IMAGE')
      expect(result).toContain('engagement')
      expect(result).toContain('Promo verano')
    })

    it('formats char limits', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
        charLimits: { headline: 40, primaryText: 125 },
      })
      expect(result).toContain('headline: máximo 40 caracteres')
      expect(result).toContain('primaryText: máximo 125 caracteres')
    })

    it('includes hookType when provided', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
        hookType: 'question',
        charLimits: { headline: 40 },
      })
      expect(result).toContain('question')
    })

    it('contiene seccion REGLAS DE PERFORMANCE EN META ADS', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
        charLimits: { headline: 40 },
      })
      expect(result).toContain('REGLAS DE PERFORMANCE EN META ADS')
    })

    it('contiene regla sobre PRIMARY TEXT', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
        charLimits: { headline: 40 },
      })
      expect(result).toContain('PRIMARY TEXT')
    })
  })

  describe('getCopyUserPrompt con funnel stage', () => {
    it('con funnelStage TOFU contiene "ARTE FRIO" y "NO conoce la marca"', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
        charLimits: { headline: 40 },
        funnelStage: 'TOFU',
      })
      expect(result).toContain('ARTE FRIO')
      expect(result).toContain('NO conoce la marca')
    })

    it('con funnelStage BOFU contiene "ARTE CALIENTE" y "LISTA para comprar"', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'conversions',
        concept: 'Test',
        charLimits: { headline: 40 },
        funnelStage: 'BOFU',
      })
      expect(result).toContain('ARTE CALIENTE')
      expect(result).toContain('LISTA para comprar')
    })

    it('con funnelStage MOFU contiene "ARTE TIBIO"', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'engagement',
        concept: 'Test',
        charLimits: { headline: 40 },
        funnelStage: 'MOFU',
      })
      expect(result).toContain('ARTE TIBIO')
    })

    it('sin funnelStage NO contiene "Etapa del embudo"', () => {
      const result = getCopyUserPrompt({
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
        charLimits: { headline: 40 },
      })
      expect(result).not.toContain('Etapa del embudo')
    })
  })
})

describe('Image Director prompts', () => {
  describe('getImageDirectorSystemPrompt', () => {
    it('returns a string with DALL-E instructions', () => {
      const result = getImageDirectorSystemPrompt()
      expect(result).toContain('DALL-E')
    })

    it('instructs to write in English', () => {
      const result = getImageDirectorSystemPrompt()
      expect(result).toContain('ENGLISH')
    })

    it('warns against text in images', () => {
      const result = getImageDirectorSystemPrompt()
      expect(result).toContain('NEVER include text')
    })
  })

  describe('getImageDirectorUserPrompt', () => {
    it('includes all input fields', () => {
      const result = getImageDirectorUserPrompt({
        visualConcept: 'Sunset beach',
        brandColors: ['#FF5733', '#3498DB'],
        platform: 'META_FEED',
        aspectRatio: '1:1',
        brandName: 'BeachCo',
      })
      expect(result).toContain('Sunset beach')
      expect(result).toContain('#FF5733')
      expect(result).toContain('META_FEED')
      expect(result).toContain('1:1')
      expect(result).toContain('BeachCo')
    })

    it('includes style when provided', () => {
      const result = getImageDirectorUserPrompt({
        visualConcept: 'Test',
        brandColors: [],
        platform: 'TIKTOK',
        aspectRatio: '9:16',
        style: 'minimalist',
        brandName: 'X',
      })
      expect(result).toContain('minimalist')
    })

    it('incluye funnel stage TOFU con contexto en ingles', () => {
      const result = getImageDirectorUserPrompt({
        visualConcept: 'Test',
        brandColors: [],
        platform: 'META_FEED',
        aspectRatio: '1:1',
        brandName: 'X',
        funnelStage: 'TOFU',
      })
      expect(result).toContain('TOFU')
      expect(result).toContain('Cold audience')
    })

    it('sin funnelStage no incluye funnel context', () => {
      const result = getImageDirectorUserPrompt({
        visualConcept: 'Test',
        brandColors: [],
        platform: 'META_FEED',
        aspectRatio: '1:1',
        brandName: 'X',
      })
      expect(result).not.toContain('Funnel stage')
    })

    it('con productInfo incluye "Product/Service"', () => {
      const result = getImageDirectorUserPrompt({
        visualConcept: 'Test',
        brandColors: [],
        platform: 'META_FEED',
        aspectRatio: '1:1',
        brandName: 'X',
        productInfo: 'Zapatos artesanales',
      })
      expect(result).toContain('Product/Service')
      expect(result).toContain('Zapatos artesanales')
    })
  })
})

describe('Video Director prompts', () => {
  describe('getVideoDirectorSystemPrompt', () => {
    it('includes brand name', () => {
      const result = getVideoDirectorSystemPrompt({ brandName: 'VideoMarca' })
      expect(result).toContain('VideoMarca')
    })

    it('uses fallback for missing fields', () => {
      const result = getVideoDirectorSystemPrompt({ brandName: 'X' })
      expect(result).toContain('No definida')
      expect(result).toContain('Público general')
    })

    it('mentions TikTok native content', () => {
      const result = getVideoDirectorSystemPrompt({ brandName: 'X' })
      expect(result).toContain('TikTok')
    })

    it('con painPoints incluye "Problemas que resuelve"', () => {
      const result = getVideoDirectorSystemPrompt({
        brandName: 'X',
        painPoints: 'Ansiedad por el trafico',
      })
      expect(result).toContain('Problemas que resuelve')
      expect(result).toContain('Ansiedad por el trafico')
    })
  })

  describe('getVideoDirectorUserPrompt', () => {
    it('includes all required fields', () => {
      const result = getVideoDirectorUserPrompt({
        concept: 'Unboxing de producto',
        platform: 'META_REELS',
        duration: '30s',
        objective: 'engagement',
      })
      expect(result).toContain('Unboxing de producto')
      expect(result).toContain('META_REELS')
      expect(result).toContain('30s')
      expect(result).toContain('engagement')
    })

    it('includes strategy when provided', () => {
      const strategy = { creative_concept: 'Verano' }
      const result = getVideoDirectorUserPrompt({
        concept: 'Test',
        platform: 'TIKTOK',
        duration: '15s',
        objective: 'awareness',
        strategy,
      })
      expect(result).toContain('Verano')
    })

    it('requests two variants (produced and UGC)', () => {
      const result = getVideoDirectorUserPrompt({
        concept: 'Test',
        platform: 'TIKTOK',
        duration: '15s',
        objective: 'awareness',
      })
      expect(result).toContain('produced')
      expect(result).toContain('UGC')
    })
  })
})
