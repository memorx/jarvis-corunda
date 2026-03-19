/**
 * Recomienda un content mix basado en el presupuesto mensual.
 * Basado en las reglas prácticas de Emilio:
 * - Presupuesto bajo (< $5,000 MXN): pocos artes, enfocar en 1-2 formatos
 * - Presupuesto medio ($5,000 - $15,000): mix moderado
 * - Presupuesto alto (> $15,000): testing agresivo con muchos artes
 *
 * La lógica: más presupuesto = más variantes para que la plataforma testee
 * y encuentre el ganador.
 */
export function recommendContentMix(budget: number, platforms: string[]): {
  staticImages: number
  videos: number
  carousels: number
  stories: number
  reasoning: string
} {
  const platformCount = platforms.length || 1

  if (budget <= 0) {
    return {
      staticImages: 4,
      videos: 2,
      carousels: 1,
      stories: 2,
      reasoning: 'Sin presupuesto definido. Mix básico recomendado para contenido orgánico.',
    }
  }

  if (budget < 3000) {
    return {
      staticImages: Math.max(2, platformCount),
      videos: 1,
      carousels: 0,
      stories: 1,
      reasoning: `Con ${budget.toLocaleString()} MXN, enfoca en pocos artes de alta calidad. Una imagen por plataforma + 1 video corto. No disperses el presupuesto en muchos formatos.`,
    }
  }

  if (budget < 8000) {
    return {
      staticImages: Math.max(3, platformCount * 2),
      videos: 2,
      carousels: 1,
      stories: 2,
      reasoning: `Con ${budget.toLocaleString()} MXN, puedes testear 2-3 variantes por formato. La plataforma necesita opciones para optimizar. Incluye al menos 2 videos — los videos suelen tener mejor performance.`,
    }
  }

  if (budget < 20000) {
    return {
      staticImages: Math.max(5, platformCount * 3),
      videos: 4,
      carousels: 2,
      stories: 3,
      reasoning: `Con ${budget.toLocaleString()} MXN, puedes hacer testing creativo agresivo. Crea múltiples variantes de cada formato para que la plataforma encuentre los ganadores. Rota artes cada 1-2 semanas.`,
    }
  }

  // High budget
  return {
    staticImages: Math.max(8, platformCount * 4),
    videos: 6,
    carousels: 3,
    stories: 5,
    reasoning: `Con ${budget.toLocaleString()} MXN, necesitas volumen creativo alto. Testea 4+ variantes por plataforma, rota semanalmente, y mata rápido los artes que no jalen. El volumen creativo es tu principal ventaja.`,
  }
}
