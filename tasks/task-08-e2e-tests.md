# Task 08: Implement End-to-End Tests

## Priority: Medium

## Description
Create comprehensive E2E tests using Playwright to test critical user journeys, responsive design, and overall application functionality.

## Dependencies
- Task 06: Testing Framework Setup (must be completed)
- Task 07: Unit Tests (can work in parallel)

## Implementation Steps

### 1. **Create E2E Test Structure**
   ```bash
   mkdir -p e2e/fixtures
   mkdir -p e2e/pages
   mkdir -p e2e/tests
   ```

### 2. **Create Page Objects**
   - Create `e2e/pages/HomePage.ts`:
   ```typescript
   export class HomePage {
     constructor(private page: Page) {}
     
     async goto() {
       await this.page.goto('/')
     }
     
     async navigateToBlog() {
       await this.page.click('text=Blog')
     }
     
     async searchPosts(query: string) {
       await this.page.fill('[data-testid="search"]', query)
     }
   }
   ```

### 3. **Test: Blog Navigation Flow**
   - Create `e2e/tests/blog-navigation.spec.ts`:
   ```typescript
   test.describe('Blog Navigation', () => {
     test('should navigate through blog categories', async ({ page }) => {
       // Visit homepage
       // Click on Blog
       // Select a category
       // Verify posts are filtered
       // Click on a post
       // Verify post content loads
     })
     
     test('should use breadcrumb navigation', async ({ page }) => {
       // Navigate to a blog post
       // Click breadcrumb links
       // Verify navigation works
     })
   })
   ```

### 4. **Test: Author Pages**
   - Create `e2e/tests/author.spec.ts`:
   ```typescript
   test.describe('Author Pages', () => {
     test('should display author information', async ({ page }) => {
       // Navigate to author page
       // Verify author details
       // Check social links
       // Verify author posts listed
     })
     
     test('should navigate from post to author', async ({ page }) => {
       // Open a blog post
       // Click author name
       // Verify navigation to author page
     })
   })
   ```

### 5. **Test: Table of Contents**
   - Create `e2e/tests/table-of-contents.spec.ts`:
   ```typescript
   test.describe('Table of Contents', () => {
     test('should highlight active section on scroll', async ({ page }) => {
       // Navigate to blog post
       // Verify ToC is visible
       // Scroll through article
       // Check active section updates
     })
     
     test('should navigate to sections on click', async ({ page }) => {
       // Click ToC links
       // Verify smooth scroll
       // Check URL hash updates
     })
   })
   ```

### 6. **Test: Responsive Design**
   - Create `e2e/tests/responsive.spec.ts`:
   ```typescript
   test.describe('Responsive Design', () => {
     test('mobile navigation works', async ({ page, isMobile }) => {
       // Test mobile menu
       // Verify ToC hidden on mobile
       // Check touch interactions
     })
     
     test('images are responsive', async ({ page }) => {
       // Check image loading
       // Verify srcset attributes
       // Test lazy loading
     })
   })
   ```

### 7. **Test: Theme Switching**
   - Create `e2e/tests/theme.spec.ts`:
   ```typescript
   test.describe('Theme Switching', () => {
     test('should toggle between light and dark mode', async ({ page }) => {
       // Click theme toggle
       // Verify theme changes
       // Check localStorage persistence
       // Verify no flash on reload
     })
   })
   ```

### 8. **Test: Performance and SEO**
   - Create `e2e/tests/performance.spec.ts`:
   ```typescript
   test.describe('Performance', () => {
     test('should load quickly', async ({ page }) => {
       const metrics = await page.evaluate(() => 
         JSON.stringify(window.performance.timing)
       )
       // Assert load time < 3s
     })
     
     test('should have proper meta tags', async ({ page }) => {
       // Check meta tags
       // Verify OpenGraph tags
       // Test structured data
     })
   })
   ```

## E2E Test Utilities

### Create Test Helpers
- Create `e2e/helpers/index.ts`:
```typescript
export async function login(page: Page) {
  // Helper for authentication if needed
}

export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle')
}

export async function mockPrismicResponse(page: Page, data: any) {
  await page.route('**/api.prismic.io/**', route => {
    route.fulfill({ body: JSON.stringify(data) })
  })
}
```

## Visual Regression Tests
```typescript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png')
})
```

## Accessibility Tests
```typescript
test('should be accessible', async ({ page }) => {
  await page.goto('/')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
```

## Testing Checklist
- [ ] Homepage loads correctly
- [ ] Blog navigation works
- [ ] Category filtering functions
- [ ] Post pages render properly
- [ ] Author pages display correctly
- [ ] Table of contents works
- [ ] Theme switching persists
- [ ] Mobile navigation functions
- [ ] Search works (if implemented)
- [ ] Social sharing works
- [ ] Performance metrics pass
- [ ] No accessibility violations

## Success Criteria
- All critical user paths tested
- Tests run in < 2 minutes
- Tests are stable (no flaky tests)
- Visual regression tests pass
- Accessibility standards met
- Works on mobile and desktop