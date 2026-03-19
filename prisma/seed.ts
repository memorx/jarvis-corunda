import 'dotenv/config'
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
  await prisma.accountDocument.deleteMany()
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

  // Real client accounts
  const pepeGauchoAccount = await prisma.account.create({
    data: {
      name: 'Pepe Gaucho',
      brandName: 'Pepe Gaucho',
      industry: 'Restaurante / Gastronomía',
      description: 'Restaurante de cortes de carne de importación argentina en Morelia, Michoacán. 14 años de trayectoria. Concepto familiar, cálido, seguro. "Tu casa fuera de casa."',
      brandVoice: 'Cercano, cálido, familiar, un poco rebelde pero con corazón. Como el tío buena onda de la familia. NO es formal ni pretencioso. Usa "tú" siempre. Humor ligero y calidez. Mexicano natural de Morelia.',
      brandColors: ['#8B4513', '#D2691E', '#2F1B14', '#F5DEB3', '#C41E3A'],
      targetAudience: 'Familias jóvenes con hijos (32-48 años) en Morelia. Padres que buscan un lugar seguro, cómodo y con buena carne para comer con la familia. También: ejecutivos/godines que buscan un lugar para comer entre semana, parejas jóvenes que quieren un plan romántico accesible, y gente de fuera (Zamora, Pátzcuaro, La Huerta) que visita Morelia.',
      competitors: 'Valentina (más fiesta/ruido), Vicente (más formal/elegante), restaurantes de moda que abren y cierran en 3 meses. Pepe Gaucho compite por ser el lugar ESTABLE al que regresas, no el lugar de moda.',
      guidelines: 'NUNCA comunicar como bar o antro. NO usar "cortes y coctelería" — suena a bar. SÍ usar "tu casa fuera de casa". Mostrar familias disfrutando, no solo platos. La seguridad de los niños es diferenciador clave. El pastel/postre gratis de cumpleaños es motor de reservaciones. Carne argentina certificada = sello de calidad único en Morelia.',
      sampleCopies: '¿Buscas un lugar donde tus hijos juegan felices mientras tú disfrutas un corte de primera? En Pepe Gaucho, tu familia se siente como en casa. 🥩👨‍👩‍👧‍👦',
      painPoints: 'Los papás no encuentran restaurantes de carne donde llevar a sus hijos sin preocuparse. Los lugares "nice" son formales y no kid-friendly. Los lugares casuales no tienen calidad de carne. Pepe Gaucho resuelve ambos: carne premium + ambiente familiar seguro.',
      differentiators: 'Único restaurante en Morelia con carne argentina certificada de importación. Área de niños con cámaras de monitoreo. Postre/pastel gratis para cumpleañeros. Dueños presentes que saludan en mesas. 14 años de historia — clientes que venían de niños ahora traen a sus hijos.',
      productInfo: 'Cortes de carne argentina de importación (rib eye/ancho y otro corte certificado). Pizzas artesanales. Coctelería (no es el foco). No cobran descorche — puedes traer tu botella de vino. Capacidad: 17 mesas, 72-74 comensales. Rotación: 3-4 llenos en fin de semana, hasta 7 vueltas en fechas fuertes (10 de mayo).',
      priceRange: 'Cortes desde $350 hasta $800 MXN. Pizzas desde $180. Una pareja puede cenar por $500 (pizza + su botella de vino sin descorche). Ticket promedio familiar: $1,200-$2,500.',
      salesProcess: 'Reservaciones por WhatsApp, llamada directa, o mensaje directo al dueño. No tienen sistema de reservas digital. La gente también llega sin reservación entre semana.',
      websiteUrl: null,
      instagramUrl: 'https://www.instagram.com/pepegaucho/',
      facebookUrl: 'https://www.facebook.com/pepegaucho/',
      platforms: ['META_FEED', 'META_STORIES', 'META_REELS', 'GOOGLE_DISPLAY'],
      contentTypes: ['STATIC_IMAGE', 'VIDEO_SHORT', 'CAROUSEL', 'STORY'],
      monthlyBudget: 8000,
    },
  })

  const coprinciAccount = await prisma.account.create({
    data: {
      name: 'Coprinci',
      brandName: 'Coprinci',
      industry: 'Construcción y Mantenimiento Industrial',
      description: 'Empresa de construcción y mantenimiento industrial con 16 años de experiencia. Especialistas en pisos epóxicos, techumbres/naves industriales, y cuadrillas de mantenimiento certificadas. Operan en Michoacán, Guanajuato, Querétaro, Toluca y CDMX.',
      brandVoice: 'Profesional, confiable, técnico pero accesible. Inspira seguridad y continuidad. NO usa jerga excesivamente técnica. Habla de resultados y cumplimiento. Tono de "socio estratégico" no de "proveedor".',
      brandColors: ['#1B3A4B', '#FF6B35', '#F0F0F0', '#333333'],
      targetAudience: 'Gerentes de planta, directores de operaciones, y responsables de mantenimiento de empresas manufactureras y de alimentos en el Bajío y centro de México. Empresas medianas a grandes que necesitan proveedores confiables para mantenimiento continuo.',
      competitors: 'Otras constructoras de mantenimiento industrial en el Bajío. La competencia principal es la rotación de proveedores — empresas que cambian de proveedor constantemente porque no encuentran uno confiable.',
      guidelines: 'NO vender pisos epóxicos — vender CONTINUIDAD OPERATIVA. El mensaje central es: "Tu planta no puede detenerse. Nosotros tampoco." Enfocarse en confiabilidad, cumplimiento, y certificaciones. Mostrar casos de éxito con empresas reconocidas (FEMSA, etc.).',
      sampleCopies: 'Tu planta no puede detenerse. Nosotros tampoco. 16 años manteniendo la operación de la industria mexicana en marcha. Coprinci: construcción y mantenimiento industrial de confianza.',
      painPoints: 'Los gerentes de planta no pueden darse el lujo de que un proveedor falle — una planta detenida cuesta miles de pesos por hora. Rotan proveedores constantemente porque no encuentran uno confiable. Necesitan un socio que entienda sus tiempos, sus estándares, y que cumpla sin excusas.',
      differentiators: 'FEMSA como cliente ancla (80% de ingresos = prueba de confiabilidad extrema). 16 años sin perder al cliente principal. Cuadrillas propias certificadas (no subcontratan). Tres líneas de servicio integradas: pisos + techumbres + mantenimiento.',
      productInfo: 'Tres líneas de servicio: 1) Pisos epóxicos industriales (aplicación y mantenimiento). 2) Techumbres y naves industriales (construcción y remodelación). 3) Cuadrillas de mantenimiento certificadas (servicio recurrente mensual). Tickets: desde $60K/mes (cuadrilla) hasta $7M (nave industrial).',
      priceRange: 'Cuadrilla de mantenimiento: desde $60,000 MXN/mes. Piso epóxico: $150,000-$500,000 por proyecto. Nave industrial: $2M-$7M por proyecto.',
      salesProcess: 'Contacto directo con gerentes de planta. Visitas técnicas. Cotización detallada. Proceso de licitación en empresas grandes. Relación a largo plazo — los contratos de cuadrilla son mensuales recurrentes.',
      platforms: ['META_FEED', 'LINKEDIN', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY'],
      contentTypes: ['STATIC_IMAGE', 'VIDEO_SHORT', 'CAROUSEL'],
      monthlyBudget: 15000,
    },
  })

  console.log('✅ Created 6 accounts (4 demo + 2 real)')

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
      // Pepe Gaucho
      { userId: diego.id, accountId: pepeGauchoAccount.id, role: 'account_manager' },
      { userId: cesar.id, accountId: pepeGauchoAccount.id, role: 'strategist' },
      { userId: emilio.id, accountId: pepeGauchoAccount.id, role: 'trafficker' },
      // Coprinci
      { userId: diego.id, accountId: coprinciAccount.id, role: 'account_manager' },
      { userId: cesar.id, accountId: coprinciAccount.id, role: 'strategist' },
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

  // Knowledge Base documents — Pepe Gaucho
  const pepeKickoffContent = `El objetivo principal es el tema de reservaciones, ese es el gran objetivo. Pero también, visualmente y comunicativamente hablando, este lugar nunca ha sido visto como un sitio de descontrol.

Concepto: "Elegancia descalza" — no es un lugar pretencioso pero tampoco es informal. Es cómodo, un lugar donde puedes disfrutar con tu familia.

Gente joven con hijos. Donde puedas venir con tu pareja y tus dos niños, y te sientas cómodo. Cuando llegas y ves niños, da tranquilidad; porque piensas "mi hijo no va a ser el único que está encima del sillón, aquí todos estamos igual". Tenemos cámaras de monitoreo, área de niños.

Somos un lugar hogar: comida para compartir, comodidad, el olor de la carne que te remonta a un buen corte, a un buen taco, a una buena historia.

Aquí puede llegar un limonero, un aguacatero, un ganadero que no se siente cómodo en un lugar como Vicente (más formal). Aquí sí viene a gusto y se siente rey.

Los domingos viene gente de Trasma, de jerarquías altas, gente que viene después de jugar golf o tenis. Solo se ponen el pants. Es como la extensión de su club o de su casa.

Nuestro público fuerte está entre 32 y 48 años, con hijos, padres jóvenes. Los 14 años de historia son representativos, pero su público principal ha ido envejeciendo. Queremos renovar la cartera de clientes, mantener a los que tenemos pero atraer nuevas generaciones.

Gente de la Huerta, Europa, Zamora, Pátzcuaro — ese mercado es extenso y no nos conoce.

La calidad de los alimentos es excepcional. Tanto Rocío como yo siempre estamos vigilando el servicio, pasamos a las mesas, preguntamos si todo está bien.

Carne de importación argentina certificada. Somos el único restaurante en Morelia con este tipo de carne. Rib eye (ancho) y otro corte argentino certificado.

Regalamos postrecito al cumpleañero, permitimos que traigan su pastel sin problema. No cobramos descorche.

17 mesas, 72-74 comensales. En fechas fuertes hasta 7 vueltas. Buen fin de semana: 3-4 llenos.

Queremos transmitir: Pepe Gaucho como "tu casa fuera de casa". Lugar seguro y cómodo para familias, parejas y amigos. Comunicación digital coherente con esa esencia: mensajes humanos, imágenes de personas disfrutando, campañas segmentadas para zonas clave.`

  await prisma.accountDocument.create({
    data: {
      accountId: pepeGauchoAccount.id,
      title: 'Kickoff Pepe Gaucho — Reunión 01/12/2025',
      type: 'kickoff',
      content: pepeKickoffContent,
      charCount: pepeKickoffContent.length,
      isActive: true,
      uploadedById: cesar.id,
    },
  })

  const pepeAuditContent = `AUDITORÍA DE RESEÑAS · PEPE GAUCHO
4.3 Calificación general en Google. 654 Opiniones. 356 analizadas con comentario.

PATRONES POSITIVOS (lo que los clientes AMAN):
- Calidad de la carne: "Muy rica", "garantía", "excelente término", "siempre consistente". La carne ES el producto estrella.
- Ambiente familiar: "Un lugar para venir con niños", "Nos sentimos muy cómodos", "Ideal para domingo". Refugio familiar y "casa donde comer rico". FORTALEZA competitiva más grande.
- Área de niños / Kids friendly: "Mis hijos se divirtieron", "Puedo comer tranquila mientras juegan". NO está siendo capitalizado en redes pero SÍ está en la mente del cliente.
- Buen servicio cuando hay dueño presente: "La dueña muy amable", "Se nota cuando pasan a saludar". Liderazgo visible = percepción de calidad.
- Relación calidad-precio justa: "No es barato, pero lo vale". No se quejan del precio, se quejan cuando el servicio no está al nivel.
- Celebraciones: "Siempre celebramos aquí", "Buen detalle del pastel". Motor oculto de reservaciones.

PATRONES NEGATIVOS (lo que duele):
- Inconsistencia en servicio (MAYOR PROBLEMA): "Tardaron muchísimo", "Nos ignoraron", "Servicio lento", "Parecía que los meseros no querían estar ahí". El servicio NO es malo, es INCONSTANTE. Peor que ser promedio.
- Meseros con mala actitud: "El mesero estaba de malas", "Parece que les molesta atender". Cultura interna bien intencionada pero no estandarizada.
- Tiempos de espera: "Tuvimos que pedir la cuenta tres veces". Mata la recomendación.

RED FLAGS OCULTAS:
- Clientes que aman comida pero NO regresan por servicio: "Me encanta la comida, pero el servicio es tan inconsistente que mejor voy a otro lugar." FUGA SILENCIOSA.
- Padres juzgados con niños: "No les gustó que los niños hicieran ruido." Va EN CONTRA del posicionamiento central.

OPORTUNIDADES DE ORO:
- "El lugar donde se sienten cómodos todos" — incluyente sin pretensiones.
- Único con carne argentina certificada — menos del 5% lo menciona. HAY QUE EXPLOTARLO.
- Área infantil + seguridad como punta de lanza de comunicación visual.
- Celebraciones como motor de reservaciones: programa automatizado de cumpleaños.
- Liderazgo cercano de dueños: oro puro en hospitalidad.`

  await prisma.accountDocument.create({
    data: {
      accountId: pepeGauchoAccount.id,
      title: 'Auditoría de Reseñas Google — Pepe Gaucho',
      type: 'audit',
      content: pepeAuditContent,
      charCount: pepeAuditContent.length,
      isActive: true,
      uploadedById: cesar.id,
    },
  })

  const pepeMatrizContent = `MATRIZ DE OPTIMIZACIÓN DEL CRECIMIENTO – PEPE GAUCHO

1. FLUJO DE CLIENTES: Muchas personas en Morelia no conocen Pepe Gaucho. Estrategia: contenido en redes (reels experiencia, videos cortes a la parrilla, historias de clientes), campañas geolocalizadas Meta Ads, Google Business.

2. OCUPACIÓN ENTRE SEMANA: Mesas vacías L-M-X. Estrategia: experiencias gastronómicas (cena parejas, noche de vino, experiencia parrillera con chef), menú especial para dos.

3. RECURRENCIA: Solo 32% de clientes regresan. Estrategia: base de datos de clientes, campañas WhatsApp, programa de fidelización con beneficios por visitas (3 visitas: postre, 5: descuento 10%, 10: experiencia especial).

4. VISIBILIDAD DIGITAL: Pocas reseñas (3/mes). Estrategia: QR en mesas para reseñas, solicitud post-visita por WhatsApp, incentivo rifa mensual.

5. TICKET PROMEDIO: Puede optimizarse. Estrategia: venta sugerida por meseros (entradas, maridajes, postres).

6. CUMPLEAÑOS: Mesas de 4-8+ personas con alto ticket ($1,500-$3,000+). Captar 8-10 extra al mes = $12K-$30K adicionales. Estrategia: landing page de paquetes cumpleaños + pauta Meta segmentada por cumpleaños próximo.

7. REMARKETING: Pixel de Meta + audiencias personalizadas (visitantes web 30d, interacciones IG/FB 60d, lookalike de clientes).

8. EVENTOS: Calendario mensual temático — Lunes Empanadas, Martes para Dos, Miércoles Noche de Vino, 1er Jueves Experiencia Parrillera.`

  await prisma.accountDocument.create({
    data: {
      accountId: pepeGauchoAccount.id,
      title: 'Matriz de Crecimiento — Pepe Gaucho',
      type: 'strategy',
      content: pepeMatrizContent,
      charCount: pepeMatrizContent.length,
      isActive: true,
      uploadedById: cesar.id,
    },
  })

  console.log('✅ Created 3 Knowledge Base documents for Pepe Gaucho')

  // Knowledge Base documents — Coprinci
  const coprinciKickoffContent = `COPRINCI — Construcción y Mantenimiento Industrial. 16 años de operación.

Tres líneas de servicio: 1) Pisos epóxicos industriales, 2) Techumbres y naves industriales, 3) Cuadrillas de mantenimiento certificadas.

FEMSA representa el 80% de sus ingresos. Han mantenido este cliente durante toda su historia — prueba de confiabilidad extrema, pero también un riesgo de dependencia.

Operan en Michoacán, Guanajuato, Querétaro, Toluca y CDMX. Sus cuadrillas son propias, no subcontratan.

Tickets van desde $60K/mes por una cuadrilla de mantenimiento hasta $7M por construcción de nave industrial completa.

El mayor reto comercial: diversificar la cartera. Hoy dependen mucho de FEMSA y necesitan abrir mercado con otras empresas manufactureras del Bajío.

Perfil del decisor: gerente de planta, director de operaciones, responsable de mantenimiento. Son personas técnicas, orientadas a resultados, que valoran cumplimiento y certificaciones.

El dolor del cliente: una planta detenida cuesta miles por hora. Rotan proveedores porque no encuentran uno confiable. Coprinci resuelve eso.`

  await prisma.accountDocument.create({
    data: {
      accountId: coprinciAccount.id,
      title: 'Reunión de Kickoff — Coprinci',
      type: 'kickoff',
      content: coprinciKickoffContent,
      charCount: coprinciKickoffContent.length,
      isActive: true,
      uploadedById: cesar.id,
    },
  })

  const coprinciStrategyContent = `HALLAZGOS ESTRATÉGICOS DE MARKETING — COPRINCI

1. NO VENDER PISOS EPÓXICOS — VENDER CONTINUIDAD OPERATIVA.
"Tu planta no puede detenerse. Nosotros tampoco." Este es el mensaje central. El cliente no compra un piso; compra tranquilidad operativa.

2. FEMSA COMO PRUEBA DE CONFIANZA.
16 años con el mismo cliente principal. Esto es inaudito en la industria. Es la mejor carta de presentación: "Si FEMSA confía en nosotros desde hace 16 años, tu operación está en buenas manos."

3. DIVERSIFICACIÓN URGENTE.
80% de ingresos en un solo cliente = riesgo existencial. Necesitan penetrar nuevas cuentas en el Bajío manufacturero: León, Celaya, Querétaro, Toluca.

4. LAS CUADRILLAS SON EL CABALLO DE TROYA.
El servicio de cuadrillas ($60K/mes) es la puerta de entrada. Una vez que el cliente prueba la calidad del servicio recurrente, es natural que le pidan proyectos más grandes (pisos, techumbres, naves).

5. COMUNICACIÓN B2B REQUIERE LINKEDIN + GOOGLE.
Meta puede servir para awareness general, pero la decisión de compra en B2B industrial pasa por LinkedIn (networking con gerentes) y Google Search (cuando buscan "mantenimiento industrial Bajío").

6. CASOS DE ÉXITO SON FUNDAMENTALES.
Necesitan documentar y comunicar proyectos exitosos con fotos del antes/después, testimonios de gerentes de planta, y datos de resultados (tiempo de ejecución, ahorro operativo).

7. CERTIFICACIONES COMO DIFERENCIADOR.
Sus cuadrillas están certificadas. Esto les da ventaja sobre competidores que subcontratan mano de obra. Hay que comunicarlo visiblemente.`

  await prisma.accountDocument.create({
    data: {
      accountId: coprinciAccount.id,
      title: 'Hallazgos Estratégicos — Coprinci',
      type: 'strategy',
      content: coprinciStrategyContent,
      charCount: coprinciStrategyContent.length,
      isActive: true,
      uploadedById: cesar.id,
    },
  })

  console.log('✅ Created 2 Knowledge Base documents for Coprinci')

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
