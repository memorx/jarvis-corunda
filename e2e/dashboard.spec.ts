import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.manager.email, TEST_USERS.manager.password)
  })

  test('dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/)
    // Dashboard should have some heading or welcome text
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible()
  })

  test('sidebar navigation is visible', async ({ page }) => {
    // Sidebar should have navigation links
    const sidebar = page.locator('nav, [role="navigation"], aside').first()
    await expect(sidebar).toBeVisible()
  })

  test('can navigate to accounts page', async ({ page }) => {
    await page.getByRole('link', { name: /cuentas|accounts/i }).click()
    await expect(page).toHaveURL(/accounts/)
  })

  test('can navigate to team page', async ({ page }) => {
    await page.getByRole('link', { name: /equipo|team/i }).click()
    await expect(page).toHaveURL(/team/)
  })
})
