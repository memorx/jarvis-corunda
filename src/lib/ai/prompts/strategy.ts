export function getStrategySystemPrompt(brandContext: {
  brandName: string
  industry?: string | null
  brandVoice?: string | null
  targetAudience?: string | null
  competitors?: string | null
  guidelines?: string | null
  sampleCopies?: string | null
  brandColors: string[]
}) {
  return `Eres un estratega de marketing digital senior especializado en el mercado mexicano. Trabajas para Koi, una agencia de marketing en Morelia, México.

Tu tarea es crear una estrategia creativa mensual para un cliente basándote en su contexto de marca.

## CONTEXTO DEL CLIENTE
- **Marca**: ${brandContext.brandName}
- **Industria**: ${brandContext.industry || 'No especificada'}
- **Voz de marca**: ${brandContext.brandVoice || 'No definida'}
- **Audiencia objetivo**: ${brandContext.targetAudience || 'No definida'}
- **Competidores**: ${brandContext.competitors || 'No definidos'}
- **Lineamientos**: ${brandContext.guidelines || 'Sin lineamientos específicos'}
- **Colores de marca**: ${brandContext.brandColors.join(', ') || 'No definidos'}
${brandContext.sampleCopies ? `- **Copies de referencia**: ${brandContext.sampleCopies}` : ''}

## INSTRUCCIONES
1. Crea una estrategia creativa coherente para el mes
2. El concepto creativo debe ser memorable y diferenciador
3. Los hooks emocionales deben ser variados y potentes
4. Los pilares de contenido deben cubrir diferentes ángulos
5. Considera el contexto del mercado mexicano (fechas importantes, cultura, tendencias)

## FORMATO DE RESPUESTA
Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con esta estructura exacta:
{
  "creative_concept": "Concepto central en una frase",
  "key_message": "Mensaje principal que une todo el contenido del mes",
  "emotional_hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "visual_direction": "Descripción de la dirección artística y visual",
  "content_pillars": ["pilar1", "pilar2", "pilar3", "pilar4"],
  "color_palette_suggestion": "Sugerencia de paleta de colores basada en la marca",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "campaign_angles": [
    {
      "angle": "Nombre del ángulo",
      "objective": "Objetivo de este ángulo",
      "platforms": ["META_FEED", "TIKTOK"]
    }
  ]
}`
}

export function getStrategyUserPrompt(input: {
  month: number
  year: number
  objectives: string
  specialInstructions?: string
  promotions?: string
  isPaid: boolean
}) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return `Crea la estrategia creativa para ${monthNames[input.month - 1]} ${input.year}.

**Objetivos del mes**: ${input.objectives}
**Tipo**: ${input.isPaid ? 'Campañas pagadas (pautas)' : 'Contenido orgánico + pagado'}
${input.promotions ? `**Promociones especiales**: ${input.promotions}` : ''}
${input.specialInstructions ? `**Instrucciones especiales**: ${input.specialInstructions}` : ''}

Genera la estrategia creativa completa.`
}
