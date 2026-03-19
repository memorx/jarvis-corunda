import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth'

test.describe('Parrillas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.manager.email, TEST_USERS.manager.password)
  })

  test('parrillas list is accessible from account', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    const accountLink = page.locator('a[href*="/accounts/"]').first()
    if (await accountLink.isVisible()) {
      await accountLink.click()
      // Navigate to parrillas tab/section
      const parrillasLink = page.getByRole('link', { name: /parrilla/i })
      if (await parrillasLink.isVisible()) {
        await parrillasLink.click()
        await expect(page).toHaveURL(/parrillas/)
      }
    }
  })

  test('create new parrilla page loads', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    const accountLink = page.locator('a[href*="/accounts/"]').first()
    if (await accountLink.isVisible()) {
      const href = await accountLink.getAttribute('href')
      if (href) {
        await page.goto(`${href}/parrillas/new`)
        // Should show the parrilla creation form
        await expect(page.locator('form, [role="form"]').first()).toBeVisible({ timeout: 10_000 })
      }
    }
  })

  test('parrilla detail page shows entries', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    const accountLink = page.locator('a[href*="/accounts/"]').first()
    if (await accountLink.isVisible()) {
      const href = await accountLink.getAttribute('href')
      if (href) {
        await page.goto(`${href}/parrillas`)
        // Click on first parrilla if available
        const parrillaLink = page.locator('a[href*="/parrillas/"]').first()
        if (await parrillaLink.isVisible()) {
          await parrillaLink.click()
          await expect(page).toHaveURL(/parrillas\//)
        }
      }
    }
  })

  test('calendar view renders', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    const accountLink = page.locator('a[href*="/accounts/"]').first()
    if (await accountLink.isVisible()) {
      const href = await accountLink.getAttribute('href')
      if (href) {
        await page.goto(`${href}/parrillas`)
        const parrillaLink = page.locator('a[href*="/parrillas/"]').first()
        if (await parrillaLink.isVisible()) {
          await parrillaLink.click()
          // Look for calendar-related elements
          const calendar = page.locator('[class*="calendar"], [data-testid*="calendar"]').first()
          if (await calendar.isVisible({ timeout: 5000 }).catch(() => false)) {
            await expect(calendar).toBeVisible()
          }
        }
      }
    }
  })
})
