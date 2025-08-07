import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('blog page should have no accessibility violations', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('blog post should have no accessibility violations', async ({ page }) => {
    // Navigate to blog page first to find a post
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    // Click on the first blog post
    const firstPost = page.locator('article').first().locator('a').first()
    const postUrl = await firstPost.getAttribute('href')

    if (postUrl) {
      await page.goto(postUrl)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(results.violations).toEqual([])
    }
  })

  test('categories page should have no accessibility violations', async ({ page }) => {
    await page.goto('/categories')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('authors page should have no accessibility violations', async ({ page }) => {
    await page.goto('/authors')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate with keyboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab through interactive elements
    await page.keyboard.press('Tab')

    // Skip navigation should be the first focusable element
    const skipNav = page.locator('a[href="#main-content"]')
    await expect(skipNav).toBeFocused()

    // Continue tabbing through navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Theme toggle should be reachable
    const themeToggle = page.locator('[aria-label*="Switch to"]').first()
    await expect(themeToggle).toBeVisible()
  })

  test('skip navigation should work', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab to skip navigation
    await page.keyboard.press('Tab')

    // Activate skip navigation
    await page.keyboard.press('Enter')

    // Main content should be focused
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })
})

test.describe('Screen Reader Support', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check main navigation
    const mainNav = page.locator('nav[aria-label="Main navigation"]')
    await expect(mainNav).toBeVisible()

    // Check theme switcher
    const themeSwitcher = page.locator('[role="group"][aria-label="Theme switcher"]')
    await expect(themeSwitcher).toBeVisible()

    // Check header banner
    const header = page.locator('header[role="banner"]')
    await expect(header).toBeVisible()

    // Check footer contentinfo
    const footer = page.locator('footer[role="contentinfo"]')
    await expect(footer).toBeVisible()
  })

  test('breadcrumbs should have proper structure', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()

    const breadcrumbList = breadcrumb.locator('ol')
    await expect(breadcrumbList).toBeVisible()
  })
})

test.describe('Color Contrast', () => {
  test('should have sufficient color contrast in light mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    })

    const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).include('body').analyze()

    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    )

    expect(contrastViolations).toEqual([])
  })

  test('should have sufficient color contrast in dark mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Ensure dark mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    })

    const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).include('body').analyze()

    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    )

    expect(contrastViolations).toEqual([])
  })
})

test.describe('Focus Management', () => {
  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab to first link
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check if focus indicator is visible
    const focusedElement = page.locator(':focus')
    const focusVisible = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return styles.outline !== 'none' || styles.boxShadow !== 'none'
    })

    expect(focusVisible).toBe(true)
  })
})
