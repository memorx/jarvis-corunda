import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.comment.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.campaignMetrics.deleteMany()
  await prisma.parrillaEntry.deleteMany()
  await prisma.parrilla.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.accountUser.deleteMany()
  await prisma.aIGenerationLog.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create users
  const hashedAdmin = await hash('admin123', 12)
  const hashedKoi = await hash('koi123', 12)
  const hashedClient = await hash('client123', 12)

  const memo = await prisma.user.create({
    data: {
      email: 'memo@jarvis.dev',
      name: 'Memo',
      password: hashedAdmin,
      role: 'SUPERADMIN',
    },
  })

  const diego = await prisma.user.create({
    data: {
      email: 'diego@koi.mx',
      name: 'Diego',
      password: hashedAdmin,
      role: 'SUPERADMIN',
    },
  })

  const cesar = await prisma.user.create({
    data: {
      email: 'cesar@koi.mx',
      name: 'César',
      password: hashedAdmin,
      role: 'SUPERADMIN',
    },
  })

  const raul = await prisma.user.create({
    data: {
      email: 'raul@koi.mx',
      name: 'Raúl',
      password: hashedKoi,
      role: 'TRAFFIC',
    },
  })

  const lupita = await prisma.user.create({
    data: {
      email: 'lupita@koi.mx',
      name: 'Lupita',
      password: hashedKoi,
      role: 'COMMUNITY',
    },
  })

  const emilio = await prisma.user.create({
    data: {
      email: 'emilio@koi.mx',
      name: 'Emilio',
      password: hashedKoi,
      role: 'DESIGNER',
    },
  })

  const clienteDemo = await prisma.user.create({
    data: {
      email: 'demo.client@test.com',
      name: 'Cliente Demo',
      password: hashedClient,
      role: 'CLIENT',
    },
  })

  console.log('✅ Created 7 users')

  // Create accounts
  const koiAccount = await prisma.account.create({
    data: {
      name: 'Koi Agency',
      brandName: 'Koi',
      industry: 'Marketing Agency',
      description: 'Agencia de marketing digital en Morelia. Para pruebas internas.',
      brandVoice: 'Profesional pero cercano. Innovador. Orientado a resultados. Usa datos para respaldar afirmaciones.',
      brandColors: ['#FF6B35', '#1A1A2E', '#00D9FF'],
      targetAudience: 'Dueños de PyMEs en Morelia y Michoacán, 30-55 años, que quieren crecer su presencia digital',
      platforms: ['META_FEED', 'META_STORIES', 'META_REELS', 'LINKEDIN', 'TIKTOK'],
      contentTypes: ['STATIC_IMAGE', 'VIDEO_SHORT', 'CAROUSEL'],
      competitors: 'Otras agencias de marketing digital en Morelia y la región',
      guidelines: 'Siempre incluir datos o estadísticas. No usar jerga técnica excesiva. Mostrar resultados reales de clientes.',
      sampleCopies: '¿Sabías que el 73% de las PyMEs que invierten en marketing digital duplican sus ventas en 6 meses? En Koi, ya lo hemos visto con nuestros clientes. 🚀',
    },
  })

  const amantiAccount = await prisma.account.create({
    data: {
      name: 'Amanti',
      brandName: 'Amanti',
      industry: 'Wellness / Intimate Products',
      description: 'Marca de bienestar íntimo para parejas',
      brandVoice: 'Sensual, elegante, empoderador. Sin vulgaridad. Enfocado en bienestar y conexión de pareja.',
      brandColors: ['#8B5CF6', '#EC4899', '#1F1F1F'],
      targetAudience: 'Parejas 25-40 años, nivel socioeconómico B+/A, interesados en bienestar sexual y conexión',
      platforms: ['META_FEED', 'META_STORIES', 'META_REELS', 'TIKTOK'],
      contentTypes: ['STATIC_IMAGE', 'VIDEO_SHORT', 'CAROUSEL', 'STORY'],
      competitors: 'Otras marcas de bienestar íntimo en México',
      guidelines: 'Nunca vulgar. Elegante y empoderador. Usar lenguaje inclusivo. Enfocarse en la conexión emocional.',
    },
  })

  const xploraAccount = await prisma.account.create({
    data: {
      name: 'Xplora Bike',
      brandName: 'Xplora Bike',
      industry: 'Bicycles / E-commerce',
      description: 'Tienda de bicicletas eléctricas y convencionales',
      brandVoice: 'Aventurero, energético, sustentable. Apela a la libertad y movilidad urbana.',
      brandColors: ['#10B981', '#F59E0B', '#1A1A2E'],
      targetAudience: 'Jóvenes y adultos 22-38 años en ciudades de México, interesados en movilidad sustentable y deporte',
      platforms: ['META_FEED', 'META_REELS', 'TIKTOK', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY'],
      contentTypes: ['STATIC_IMAGE', 'VIDEO_SHORT', 'CAROUSEL'],
      competitors: 'Benotto, Alubike, Mercado Libre sellers de bicis eléctricas',
      guidelines: 'Energético y aventurero. Mostrar beneficios de movilidad sustentable. Usar testimonios de usuarios.',
    },
  })

  const pemtAccount = await prisma.account.create({
    data: {
      name: 'PEMT Logística',
      brandName: 'PEMT',
      industry: 'Logistics',
      description: 'Empresa de logística y transporte con cobertura nacional',
      brandVoice: 'Confiable, profesional, eficiente. Usa datos de cobertura y tiempos de entrega como diferenciadores.',
      brandColors: ['#2563EB', '#1E40AF', '#F8FAFC'],
      targetAudience: 'Gerentes de operaciones y directores de supply chain en empresas medianas y grandes',
      platforms: ['META_FEED', 'LINKEDIN', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY'],
      contentTypes: ['STATIC_IMAGE', 'CAROUSEL'],
      competitors: 'DHL, FedEx, Estafeta, Redpack',
      guidelines: 'Profesional y datos-driven. Mostrar cobertura nacional. Enfocarse en confiabilidad y tiempos de entrega.',
    },
  })

  console.log('✅ Created 4 accounts')

  // Assign users to accounts
  await prisma.accountUser.createMany({
    data: [
      { userId: memo.id, accountId: koiAccount.id, role: 'lead' },
      { userId: diego.id, accountId: koiAccount.id, role: 'lead' },
      { userId: lupita.id, accountId: koiAccount.id, role: 'support' },
      { userId: emilio.id, accountId: koiAccount.id, role: 'support' },
      { userId: diego.id, accountId: amantiAccount.id, role: 'lead' },
      { userId: lupita.id, accountId: amantiAccount.id, role: 'lead' },
      { userId: emilio.id, accountId: amantiAccount.id, role: 'support' },
      { userId: raul.id, accountId: xploraAccount.id, role: 'lead' },
      { userId: lupita.id, accountId: xploraAccount.id, role: 'support' },
      { userId: raul.id, accountId: pemtAccount.id, role: 'lead' },
      { userId: clienteDemo.id, accountId: koiAccount.id, role: 'client' },
      { userId: clienteDemo.id, accountId: amantiAccount.id, role: 'client' },
    ],
  })

  console.log('✅ Assigned users to accounts')

  // Create a sample parrilla for Koi
  const parrilla = await prisma.parrilla.create({
    data: {
      accountId: koiAccount.id,
      createdById: lupita.id,
      name: 'Marzo 2026 - Koi',
      month: 3,
      year: 2026,
      description: 'Parrilla de contenidos para marzo 2026. Enfoque en generación de leads y posicionamiento.',
      status: 'DRAFT',
    },
  })

  // Create sample entries for the parrilla
  const sampleEntries = [
    {
      parrillaId: parrilla.id,
      publishDate: new Date('2026-03-03'),
      publishTime: '10:00',
      platform: 'META_FEED' as const,
      contentType: 'STATIC_IMAGE' as const,
      objective: 'awareness',
      headline: '¿Tu negocio ya tiene presencia digital?',
      primaryText: 'El 73% de las PyMEs que invierten en marketing digital duplican sus ventas en 6 meses. ¿Estás aprovechando esta oportunidad? 🚀',
      ctaText: 'Más información',
      hashtags: ['#MarketingDigital', '#PyMEs', '#Morelia', '#KoiAgency'],
      visualConcept: 'Imagen minimalista con gráfica de crecimiento, colores corporativos de Koi',
      hookType: 'question',
      status: 'DRAFT' as const,
    },
    {
      parrillaId: parrilla.id,
      publishDate: new Date('2026-03-05'),
      publishTime: '14:00',
      platform: 'META_REELS' as const,
      contentType: 'VIDEO_SHORT' as const,
      objective: 'engagement',
      headline: '3 errores que están matando tus ventas online',
      primaryText: 'Te compartimos los 3 errores más comunes que vemos en negocios que quieren vender en línea 👇',
      ctaText: 'Ver más',
      hashtags: ['#VentasOnline', '#TipsDeMarketing', '#KoiAgency'],
      visualConcept: 'Video estilo UGC con tips rápidos, texto overlay dinámico',
      hookType: 'urgency',
      status: 'DRAFT' as const,
    },
    {
      parrillaId: parrilla.id,
      publishDate: new Date('2026-03-10'),
      publishTime: '12:00',
      platform: 'LINKEDIN' as const,
      contentType: 'CAROUSEL' as const,
      objective: 'leads',
      headline: 'Caso de éxito: +200% en leads para empresa local',
      primaryText: 'Te compartimos cómo ayudamos a una empresa de Morelia a triplicar sus leads en solo 3 meses con una estrategia integral de marketing digital.',
      ctaText: 'Contactar',
      hashtags: ['#CasoDeÉxito', '#MarketingDigital', '#ResultadosReales'],
      visualConcept: 'Carrusel profesional mostrando métricas antes/después',
      hookType: 'social_proof',
      status: 'DRAFT' as const,
    },
  ]

  await prisma.parrillaEntry.createMany({
    data: sampleEntries,
  })

  console.log('✅ Created sample parrilla with 3 entries')

  // Create a sample campaign
  await prisma.campaign.create({
    data: {
      accountId: xploraAccount.id,
      name: 'Xplora Spring Sale 2026',
      platform: 'META_FEED',
      objective: 'CONVERSIONS',
      dailyBudget: 500,
      totalBudget: 15000,
      status: 'ACTIVE',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
    },
  })

  console.log('✅ Created sample campaign')
  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📧 Login credentials:')
  console.log('   Superadmin: memo@jarvis.dev / admin123')
  console.log('   Superadmin: diego@koi.mx / admin123')
  console.log('   Traffic:    raul@koi.mx / koi123')
  console.log('   Community:  lupita@koi.mx / koi123')
  console.log('   Designer:   emilio@koi.mx / koi123')
  console.log('   Client:     demo.client@test.com / client123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
