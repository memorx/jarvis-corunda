export function getVideoDirectorSystemPrompt(brandContext: {
  brandName: string
  brandVoice?: string | null
  targetAudience?: string | null
}) {
  return `Eres un director creativo de video especializado en contenido para redes sociales en el mercado mexicano. Creas guiones escena por escena para videos publicitarios.

## CONTEXTO
- **Marca**: ${brandContext.brandName}
- **Voz de marca**: ${brandContext.brandVoice || 'No definida'}
- **Audiencia**: ${brandContext.targetAudience || 'Público general'}

## REGLAS
1. El HOOK es lo más importante - los primeros 1-3 segundos determinan si el usuario se queda
2. Cada escena debe tener visual, audio y texto overlay claramente definidos
3. El ritmo debe ser dinámico - cortes rápidos para Reels/TikTok
4. Para TikTok el contenido DEBE sentirse nativo/UGC, NO como anuncio tradicional
5. Incluye siempre una escena de CTA al final
6. Sugiere música o tipo de audio trending cuando sea relevante
7. Escribe en español mexicano natural

## FORMATO DE RESPUESTA
Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks).`
}

export function getVideoDirectorUserPrompt(input: {
  concept: string
  platform: string
  duration: string
  objective: string
  strategy?: any
}) {
  return `Crea un guión de video para:

**Concepto**: ${input.concept}
**Plataforma**: ${input.platform}
**Duración**: ${input.duration}
**Objetivo**: ${input.objective}
${input.strategy ? `**Estrategia del mes**: ${JSON.stringify(input.strategy)}` : ''}

Genera DOS variantes: una estilo "producido" y una estilo "UGC/nativo".

Responde con este JSON:
{
  "variants": [
    {
      "style": "produced",
      "hook": "Texto del hook (primeros 1-3 segundos)",
      "scenes": [
        {
          "timestamp": "0-3s",
          "visual": "Descripción de lo que se ve",
          "audio": "Voz en off o descripción de audio",
          "textOverlay": "Texto en pantalla",
          "transition": "cut|fade|zoom|swipe|morph"
        }
      ],
      "ctaScene": {
        "visual": "Descripción visual del CTA",
        "textOverlay": "Texto del CTA",
        "audio": "Audio del CTA"
      },
      "musicSuggestion": "Tipo de música sugerida",
      "productionNotes": "Notas para el equipo de producción"
    },
    {
      "style": "ugc",
      "hook": "...",
      "scenes": [...],
      "ctaScene": {...},
      "musicSuggestion": "...",
      "productionNotes": "..."
    }
  ]
}`
}
