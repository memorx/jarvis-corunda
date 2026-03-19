import { vi } from 'vitest'

export const mockAccount = {
  id: 'acc-1',
  name: 'Test Account',
  brandName: 'TestBrand',
  industry: 'Technology',
  brandVoice: 'Professional and innovative',
  targetAudience: 'Young professionals 25-35',
  competitors: 'CompA, CompB',
  guidelines: 'Keep it clean',
  sampleCopies: 'Sample copy here',
  brandColors: ['#FF0000', '#00FF00'],
  platforms: ['META_FEED', 'TIKTOK'],
  contentTypes: ['STATIC_IMAGE', 'VIDEO_SHORT'],
  monthlyBudget: 50000,
  painPoints: 'No encuentran opciones de calidad',
  differentiators: 'Mejor soporte tecnico del mercado',
  productInfo: 'Software de gestion empresarial',
  priceRange: '$500 - $2,000 MXN/mes',
  salesProcess: 'Demo online + cierre por WhatsApp',
  websiteUrl: 'https://testbrand.com',
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  linkedinUrl: null,
}

export function createMockAnthropicResponse(jsonData: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(jsonData) }],
    usage: { input_tokens: 500, output_tokens: 300 },
  }
}

export function createMockAnthropicErrorResponse() {
  return {
    content: [{ type: 'tool_use' as const, id: 'x', name: 'y', input: {} }],
    usage: { input_tokens: 100, output_tokens: 0 },
  }
}
