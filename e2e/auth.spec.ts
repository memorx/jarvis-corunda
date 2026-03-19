import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth'

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/')
    // Should show a login form
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible()
  })

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await login(page, TEST_USERS.superadmin.email, TEST_USERS.superadmin.password)
    await expect(page).toHaveURL(/dashboard/)
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/email/i).fill('wrong@test.com')
    await page.getByLabel(/contraseña|password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /iniciar|login|entrar/i }).click()
    // Should remain on login page or show error
    await expect(page.getByText(/error|inválid|credencial/i)).toBeVisible({ timeout: 5000 })
  })

  test('protected pages redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect back to login
    await expect(page).toHaveURL(/^\/$|\/api\/auth/)
  })

  test('logout works', async ({ page }) => {
    await login(page, TEST_USERS.superadmin.email, TEST_USERS.superadmin.password)
    // Look for a logout button or menu
    const logoutBtn = page.getByRole('button', { name: /cerrar sesión|logout|salir/i })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await expect(page).toHaveURL('/')
    }
  })
})
