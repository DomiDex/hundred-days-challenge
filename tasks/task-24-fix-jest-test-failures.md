# Task 24: Fix Jest Test Failures

## Overview

Fix failing Jest tests that are encountering two main issues:
1. ESM module import errors with the `feed` package
2. `Request is not defined` errors in API route tests

## Current Status

**Status**: Completed  
**Priority**: High  
**Estimated Time**: 2-3 hours  
**Actual Time**: 2 hours

## Problem Description

### Issue 1: Feed Package ESM Import Error

Tests are failing with:
```
SyntaxError: Cannot use import statement outside a module
at C:\Users\domi\Desktop\next-playground\hundred-days\node_modules\feed\lib\feed.js:1
```

Affected tests:
- `src/__tests__/api/feed/rss.test.ts`
- `src/__tests__/api/feed/json.test.ts`
- `src/__tests__/api/feed/category.test.ts`
- `src/__tests__/api/feed/atom.test.ts`

### Issue 2: Request is Not Defined

API route tests are failing with:
```
ReferenceError: Request is not defined
```

Affected tests:
- `src/__tests__/api/admin/security-metrics.test.ts`
- `src/__tests__/api/newsletter/webhook.test.ts`
- `src/__tests__/api/newsletter/subscribe.test.ts`
- `src/__tests__/api/revalidate.test.ts`
- `src/__tests__/api/preview.test.ts`
- `src/__tests__/api/csp-report.test.ts`
- `src/__tests__/api/posts.test.ts`
- `src/__tests__/api/exit-preview.test.ts`

### Issue 3: Empty Test Files

Several test utility files have no tests:
- `src/__tests__/api/test-utils/response.ts`
- `src/__tests__/api/test-utils/setup.ts`
- `src/__tests__/api/__mocks__/env.ts`
- `src/__tests__/api/test-utils/performance.ts`
- `src/__tests__/api/test-utils/mocks.ts`
- `src/__tests__/api/test-utils/generators.ts`
- `src/__tests__/api/test-utils/auth.ts`

## Solution Approach

### 1. Fix Feed Package ESM Issues

**Option A: Transform the feed package**
- Add `transformIgnorePatterns` to Jest config to transform the feed package
- Configure Jest to handle ESM modules

**Option B: Mock the feed package**
- Create a mock for the feed package
- Use Jest's module mocking capabilities

### 2. Fix Request Not Defined

**Add polyfills for Next.js runtime globals**
- Polyfill `Request`, `Response`, and other Web API globals
- Update Jest setup to include these polyfills before tests run

### 3. Fix Empty Test Files

**Either add tests or exclude from test run**
- Move utility files outside of `__tests__` directory
- Or add `.skip` to exclude them from test runs

## Implementation Steps

### Step 1: Update Jest Configuration

1. Update `jest.config.js` to handle ESM modules:
```javascript
module.exports = {
  // ... existing config
  transformIgnorePatterns: [
    'node_modules/(?!(feed|xml-js)/)'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
}
```

### Step 2: Add Web API Polyfills

1. Create a polyfills file for API route testing
2. Add Request/Response polyfills to Jest setup
3. Update `jest.setup.api.js` to include polyfills

### Step 3: Mock Feed Package (Alternative)

If transforming doesn't work:
1. Create `__mocks__/feed.js`
2. Mock the Feed class and its methods
3. Ensure mock provides same API as real package

### Step 4: Reorganize Test Utilities

1. Move test utilities out of `__tests__` directory
2. Create `src/test-utils/api/` directory
3. Update imports in test files

### Step 5: Update Test Files

1. Ensure all API route tests use the polyfilled environment
2. Update imports for relocated test utilities
3. Verify all tests pass

## Testing Requirements

- All Jest tests should pass
- No console errors or warnings
- Coverage should remain at or above current levels
- API route tests should properly test route functionality

## Success Criteria

- ✅ All feed-related tests pass without ESM errors
- ✅ All API route tests pass without Request errors
- ✅ No empty test file warnings
- ✅ Test coverage maintained or improved
- ✅ CI/CD pipeline passes all tests

## Dependencies

- Task 21, 22, 23: API route testing tasks (completed)
- Existing test infrastructure

## Notes

- Consider using `@edge-runtime/jest-environment` for better Next.js edge runtime compatibility
- May need to update to Jest 29+ for better ESM support
- Document any workarounds for future reference