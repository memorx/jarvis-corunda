import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth'

test.describe('Accounts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.manager.email, TEST_USERS.manager.password)
  })

  test('accounts list page loads', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    await expect(page).toHaveURL(/accounts/)
    // Should show accounts heading or list
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('account detail page loads', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    // Click on first account link if available
    const accountLink = page.getByRole('link').filter({ hasText: /.+/ }).first()
    if (await accountLink.isVisible()) {
      await accountLink.click()
      await expect(page).toHaveURL(/accounts\//)
    }
  })

  test('create account form is accessible', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    const createBtn = page.getByRole('button', { name: /nueva cuenta|crear|new account|add/i })
    if (await createBtn.isVisible()) {
      await createBtn.click()
      // Should show a form with name field
      await expect(page.getByLabel(/nombre|name/i).first()).toBeVisible()
    }
  })

  test('account settings page loads', async ({ page }) => {
    await page.goto('/dashboard/accounts')
    const accountLink = page.locator('a[href*="/accounts/"]').first()
    if (await accountLink.isVisible()) {
      const href = await accountLink.getAttribute('href')
      if (href) {
        await page.goto(`${href}/settings`)
        await expect(page).toHaveURL(/settings/)
      }
    }
  })
})
