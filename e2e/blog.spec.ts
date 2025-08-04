import { test, expect } from '@playwright/test'

test.describe('Blog functionality', () => {
  test('navigates to blog page', async ({ page }) => {
    await page.goto('/')

    // Click on Blog link
    await page.getByRole('link', { name: /Blog/i }).click()

    // Should navigate to blog page
    await expect(page).toHaveURL('/blog')
    await expect(page.locator('h1')).toContainText(/Blog/i)
  })

  test('displays blog posts', async ({ page }) => {
    await page.goto('/blog')

    // Should display blog post cards
    const postCards = page.locator('article')
    await expect(postCards.first()).toBeVisible()

    // Each post should have title, excerpt, and metadata
    const firstPost = postCards.first()
    await expect(firstPost.locator('h2')).toBeVisible()
    await expect(firstPost.locator('p')).toBeVisible() // excerpt
    await expect(firstPost.getByText(/min read/i)).toBeVisible()
  })

  test('filters posts by category', async ({ page }) => {
    await page.goto('/blog')

    // Find and click a category badge
    const categoryBadge = page.locator('[data-testid="category-badge"]').first()
    const categoryName = await categoryBadge.textContent()
    await categoryBadge.click()

    // Should navigate to category page
    await expect(page).toHaveURL(/\/blog\/[\w-]+/)

    // Should display category name
    await expect(page.locator('h1')).toContainText(categoryName || '')
  })

  test('navigates to individual blog post', async ({ page }) => {
    await page.goto('/blog')

    // Click on first blog post
    const firstPostLink = page.locator('article').first().locator('a').first()
    await firstPostLink.click()

    // Should navigate to post page
    await expect(page).toHaveURL(/\/blog\/[\w-]+\/[\w-]+/)

    // Should display post content
    await expect(page.locator('h1')).toBeVisible() // Post title
    await expect(page.locator('[data-testid="post-content"]')).toBeVisible()
  })

  test('displays author information on post page', async ({ page }) => {
    await page.goto('/blog')

    // Navigate to a post
    await page.locator('article').first().locator('a').first().click()

    // Should display author info
    const authorSection = page.locator('[data-testid="author-info"]')
    await expect(authorSection).toBeVisible()
    await expect(authorSection.locator('img')).toBeVisible() // Author avatar
    await expect(authorSection.locator('h3')).toBeVisible() // Author name
  })

  test('shows related posts', async ({ page }) => {
    await page.goto('/blog')

    // Navigate to a post
    await page.locator('article').first().locator('a').first().click()

    // Should display related posts section
    const relatedPosts = page.locator('[data-testid="related-posts"]')
    await expect(relatedPosts).toBeVisible()
    await expect(relatedPosts.locator('article')).toHaveCount(3)
  })

  test('search functionality works', async ({ page }) => {
    await page.goto('/blog')

    // Find search input
    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toBeVisible()

    // Type search query
    await searchInput.fill('javascript')
    await searchInput.press('Enter')

    // Should filter posts
    const posts = page.locator('article')
    const count = await posts.count()

    // Verify search results (this will depend on your test data)
    if (count > 0) {
      const firstPost = posts.first()
      const text = await firstPost.textContent()
      expect(text?.toLowerCase()).toContain('javascript')
    }
  })
})
