import { Page } from '@playwright/test'

/**
 * Programmatically log in via the credentials form on the login page.
 * Assumes the app is running and the login page is at '/'.
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/contraseña|password/i).fill(password)
  await page.getByRole('button', { name: /iniciar|login|entrar/i }).click()
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 15_000 })
}

/**
 * Default test credentials — must match a seeded user in the DB.
 * Adjust to match your prisma/seed.ts values.
 */
export const TEST_USERS = {
  superadmin: {
    email: 'admin@jarvis.dev',
    password: 'admin123456',
    role: 'SUPERADMIN',
  },
  manager: {
    email: 'manager@jarvis.dev',
    password: 'manager123456',
    role: 'MANAGER',
  },
  designer: {
    email: 'designer@jarvis.dev',
    password: 'designer123456',
    role: 'DESIGNER',
  },
  client: {
    email: 'client@jarvis.dev',
    password: 'client123456',
    role: 'CLIENT',
  },
} as const
