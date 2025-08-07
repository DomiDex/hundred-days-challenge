import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/100 Days of Craft/)
  })

  test('displays hero section', async ({ page }) => {
    const hero = page.locator('[data-slice-type="hero"]')
    await expect(hero).toBeVisible()
  })

  test('shows navigation menu', async ({ page }) => {
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Check main navigation links
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Blog/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Authors/i })).toBeVisible()
  })

  test('theme toggle works', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()

    // Check initial theme (should be light by default)
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/dark/)

    // Toggle to dark theme
    await themeToggle.click()
    await expect(html).toHaveClass(/dark/)

    // Toggle back to light theme
    await themeToggle.click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('newsletter subscription form is visible', async ({ page }) => {
    const newsletterForm = page.locator('form').filter({ hasText: /subscribe/i })
    await expect(newsletterForm).toBeVisible()

    const emailInput = newsletterForm.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', /enter your email/i)
  })

  test('footer contains RSS feed link', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const rssLink = footer.getByRole('link', { name: /RSS/i })
    await expect(rssLink).toBeVisible()
    await expect(rssLink).toHaveAttribute('href', '/rss.xml')
  })

  test('responsive mobile menu', async ({ page, isMobile }) => {
    if (isMobile) {
      // Mobile menu button should be visible
      const menuButton = page.getByRole('button', { name: /menu/i })
      await expect(menuButton).toBeVisible()

      // Navigation should be hidden initially
      const nav = page.locator('nav').first()
      await expect(nav).toBeHidden()

      // Click menu button to open navigation
      await menuButton.click()
      await expect(nav).toBeVisible()
    } else {
      // Desktop navigation should be visible
      const nav = page.locator('nav').first()
      await expect(nav).toBeVisible()
    }
  })
})
