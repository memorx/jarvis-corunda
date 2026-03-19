export const PLATFORM_LABELS: Record<string, string> = {
  META_FEED: 'Meta Feed',
  META_STORIES: 'Meta Stories',
  META_REELS: 'Meta Reels',
  GOOGLE_SEARCH: 'Google Search',
  GOOGLE_DISPLAY: 'Google Display',
  GOOGLE_YOUTUBE: 'Google YouTube',
  TIKTOK: 'TikTok',
  YOUTUBE_SHORTS: 'YouTube Shorts',
  LINKEDIN: 'LinkedIn',
  TWITTER_X: 'Twitter/X',
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  STATIC_IMAGE: 'Imagen Estática',
  CAROUSEL: 'Carrusel',
  VIDEO_SHORT: 'Video Corto',
  VIDEO_LONG: 'Video Largo',
  STORY: 'Historia',
  TEXT_ONLY: 'Solo Texto',
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  INTERNAL_REVIEW: 'Revisión Interna',
  REVISION: 'En Revisión',
  APPROVED_INTERNAL: 'Aprobado Interno',
  CLIENT_REVIEW: 'Revisión Cliente',
  CLIENT_REVISION: 'Revisión Cliente',
  APPROVED: 'Aprobado',
  SCHEDULED: 'Programado',
  PUBLISHED: 'Publicado',
  PAUSED: 'Pausado',
  ARCHIVED: 'Archivado',
  IN_PRODUCTION: 'En Producción',
  COMPLETED: 'Completado',
}

export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  MANAGER: 'Manager',
  COMMUNITY: 'Community Manager',
  TRAFFIC: 'Traffic Digital',
  DESIGNER: 'Diseñador',
  PRODUCER: 'Productor',
  CLIENT: 'Cliente',
}

export const CAMPAIGN_OBJECTIVE_LABELS: Record<string, string> = {
  AWARENESS: 'Reconocimiento',
  TRAFFIC: 'Tráfico',
  ENGAGEMENT: 'Interacción',
  LEADS: 'Leads',
  CONVERSIONS: 'Conversiones',
  SALES: 'Ventas',
}

export const PLATFORM_SPECS = {
  META_FEED: {
    headline: 40,
    primaryText: 125,
    description: 30,
    ctas: ['Comprar', 'Más información', 'Registrarse', 'Reservar', 'Contactar', 'Ver oferta', 'Shop Now', 'Learn More', 'Sign Up', 'Book Now', 'Contact Us', 'Get Offer'],
    formats: ['1:1 feed', '4:5 feed', '1.91:1 link ad'],
  },
  META_STORIES: {
    textOverlay: 50,
    ctaText: 20,
    formats: ['9:16'],
  },
  META_REELS: {
    textOverlay: 50,
    description: 100,
    formats: ['9:16'],
  },
  GOOGLE_SEARCH: {
    headlines: { count: 3, maxChars: 30 },
    descriptions: { count: 2, maxChars: 90 },
    displayPath: { count: 2, maxChars: 15 },
  },
  GOOGLE_DISPLAY: {
    shortHeadline: 25,
    longHeadline: 90,
    description: 90,
  },
  TIKTOK: {
    adText: 100,
    formats: ['9:16'],
  },
  YOUTUBE_SHORTS: {
    title: 100,
    descriptionHook: 200,
    formats: ['9:16'],
  },
  LINKEDIN: {
    headline: 70,
    primaryText: 150,
    description: 100,
  },
} as const

export const IMAGE_DIMENSIONS = {
  META_FEED: [
    { width: 1080, height: 1080, ratio: '1:1', label: 'Square Feed' },
    { width: 1080, height: 1350, ratio: '4:5', label: 'Portrait Feed' },
  ],
  META_STORIES: [
    { width: 1080, height: 1920, ratio: '9:16', label: 'Stories' },
  ],
  META_REELS: [
    { width: 1080, height: 1920, ratio: '9:16', label: 'Reels Cover' },
  ],
  GOOGLE_DISPLAY: [
    { width: 1200, height: 628, ratio: '1.91:1', label: 'Landscape' },
    { width: 300, height: 250, ratio: '6:5', label: 'Medium Rectangle' },
    { width: 160, height: 600, ratio: '4:15', label: 'Skyscraper' },
  ],
  TIKTOK: [
    { width: 1080, height: 1920, ratio: '9:16', label: 'TikTok' },
  ],
  YOUTUBE_SHORTS: [
    { width: 1080, height: 1920, ratio: '9:16', label: 'Shorts' },
  ],
  GOOGLE_YOUTUBE: [
    { width: 1920, height: 1080, ratio: '16:9', label: 'YouTube Thumbnail' },
  ],
  LINKEDIN: [
    { width: 1200, height: 627, ratio: '1.91:1', label: 'LinkedIn Feed' },
  ],
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ['*'],
  MANAGER: ['accounts:read', 'accounts:write', 'parrillas:*', 'campaigns:*', 'team:read', 'playground:*', 'performance:*'],
  COMMUNITY: ['accounts:read', 'parrillas:create', 'parrillas:edit', 'parrillas:read', 'playground:*'],
  TRAFFIC: ['accounts:read', 'campaigns:*', 'parrillas:read', 'performance:*', 'playground:*'],
  DESIGNER: ['parrillas:read', 'assets:upload'],
  PRODUCER: ['parrillas:read', 'assets:upload'],
  CLIENT: ['parrillas:read:own', 'approvals:create'],
}
