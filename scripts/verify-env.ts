#!/usr/bin/env tsx

const required = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'ANTHROPIC_API_KEY',
]

const optional = [
  'OPENAI_API_KEY',
  'META_APP_ID',
  'META_APP_SECRET',
  'META_ACCESS_TOKEN',
  'META_AD_ACCOUNT_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'N8N_WEBHOOK_BASE_URL',
  'N8N_API_SECRET',
]

console.log('Verificando variables de entorno...\n')

let hasErrors = false

for (const key of required) {
  if (!process.env[key]) {
    console.log(`  ${key} — FALTANTE (requerida)`)
    hasErrors = true
  } else {
    const masked = process.env[key]!.slice(0, 8) + '...'
    console.log(`  ${key} — ${masked}`)
  }
}

console.log('')

for (const key of optional) {
  if (!process.env[key]) {
    console.log(`  ${key} — no configurada (opcional)`)
  } else {
    const masked = process.env[key]!.slice(0, 8) + '...'
    console.log(`  ${key} — ${masked}`)
  }
}

console.log('')
if (hasErrors) {
  console.log('Faltan variables requeridas. La app no funcionara correctamente.')
  process.exit(1)
} else {
  console.log('Todas las variables requeridas estan configuradas.')
}
