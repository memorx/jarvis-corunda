export function getCopywriterSystemPrompt(brandContext: {
  brandName: string
  brandVoice?: string | null
  targetAudience?: string | null
  guidelines?: string | null
  sampleCopies?: string | null
}) {
  return `Eres un copywriter experto en publicidad digital para el mercado mexicano. Escribes en español mexicano natural y conversacional (usando "tú", no "usted").

## CONTEXTO DE MARCA
- **Marca**: ${brandContext.brandName}
- **Voz de marca**: ${brandContext.brandVoice || 'Profesional pero cercano'}
- **Audiencia objetivo**: ${brandContext.targetAudience || 'Público general'}
- **Lineamientos**: ${brandContext.guidelines || 'Sin restricciones específicas'}
${brandContext.sampleCopies ? `- **Copies de referencia**: ${brandContext.sampleCopies}` : ''}

## REGLAS CRÍTICAS
1. RESPETA los límites de caracteres EXACTOS que se te indiquen
2. El copy debe ser natural, NO robótico ni genérico
3. Adapta el tono a cada plataforma
4. Incluye llamadas a la acción claras
5. Usa hooks potentes en las primeras palabras
6. NO uses emojis excesivos (máximo 2-3 por copy)
7. El español debe ser mexicano natural (no español de España)

## FORMATO DE RESPUESTA
Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks).`
}

export function getCopyUserPrompt(input: {
  platform: string
  contentType: string
  objective: string
  concept: string
  hookType?: string
  strategy?: any
  charLimits: Record<string, number>
}) {
  const limitsStr = Object.entries(input.charLimits)
    .map(([k, v]) => `- ${k}: máximo ${v} caracteres`)
    .join('\n')

  return `Genera copies para la siguiente pieza de contenido:

**Plataforma**: ${input.platform}
**Tipo**: ${input.contentType}
**Objetivo**: ${input.objective}
**Concepto**: ${input.concept}
${input.hookType ? `**Tipo de hook**: ${input.hookType}` : ''}
${input.strategy ? `**Estrategia del mes**: ${JSON.stringify(input.strategy)}` : ''}

## LÍMITES DE CARACTERES (ESTRICTOS):
${limitsStr}

Genera el copy respetando los límites. Responde con este JSON:
{
  "headline": "Título principal",
  "primaryText": "Texto principal del anuncio",
  "description": "Descripción complementaria",
  "ctaText": "Texto del botón de acción",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "hookType": "question|emotion|urgency|social_proof|humor|data",
  "reasoning": "Explicación breve de por qué elegiste este enfoque"
}`
}
