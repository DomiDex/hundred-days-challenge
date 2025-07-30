# Task 06: Testing Framework Setup and Configuration

## Priority: High

## Description

Set up a comprehensive testing framework with Jest, React Testing Library, and Playwright for unit, integration, and E2E tests to achieve 80% code coverage.

## Dependencies

- None (foundational task)

## Implementation Steps

### 1. **Install Testing Dependencies**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
npm install --save-dev @playwright/test
npm install --save-dev @types/jest ts-jest
```

### 2. **Configure Jest**

- Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/api/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 3. **Create Jest Setup File**

- Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock Prismic
jest.mock('@prismicio/client', () => ({
  createClient: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}))
```

### 4. **Configure Playwright**

- Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### 5. **Update Package Scripts**

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:all": "npm run test && npm run test:e2e"
}
```

### 6. **Create Test Utilities**

- Create `src/test-utils/index.tsx`:

```typescript
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  )
}

export * from '@testing-library/react'
export { renderWithProviders as render }
```

### 7. **Create Mock Factories**

- Create `src/test-utils/mocks.ts`:

```typescript
// Mock Prismic documents
export const mockPost = {
  id: '1',
  uid: 'test-post',
  data: {
    name: 'Test Post',
    excerpt: 'Test excerpt',
    // ... other fields
  },
}

export const mockAuthor = {
  id: '1',
  uid: 'test-author',
  data: {
    name: 'Test Author',
    // ... other fields
  },
}
```

## Testing Structure

```
src/
  __tests__/
    components/     # Component unit tests
    hooks/         # Hook tests
    lib/           # Utility function tests
  test-utils/      # Test utilities and mocks
e2e/
  blog.spec.ts     # Blog E2E tests
  navigation.spec.ts # Navigation E2E tests
```

## Testing Guidelines

### Unit Tests

- Test components in isolation
- Mock external dependencies
- Focus on user interactions
- Test error states

### Integration Tests

- Test component interactions
- Test data flow
- Mock API responses
- Test routing

### E2E Tests

- Test critical user journeys
- Test responsive design
- Test performance metrics
- Test accessibility

## Coverage Goals

- Components: 90%
- Hooks: 85%
- Utilities: 95%
- Pages: 80%
- Overall: 80%

## Success Criteria

- Testing framework properly configured
- All test commands working
- Coverage reporting enabled
- E2E tests running locally and in CI
- Test utilities created for common patterns
- Mock data factories available
