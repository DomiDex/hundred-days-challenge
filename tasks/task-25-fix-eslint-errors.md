# Task 25: Fix ESLint Errors

## Overview

Fix all ESLint errors and warnings in the codebase, particularly focusing on:
1. Removing `any` types and replacing with proper TypeScript types
2. Removing unused imports and variables
3. Converting require imports to ES modules

## Current Status

**Status**: To Do  
**Priority**: High  
**Estimated Time**: 1-2 hours

## Problem Description

Running `npm run lint` reveals several ESLint violations:

### Type Errors (11 instances)
- `@typescript-eslint/no-explicit-any`: Multiple files using `any` type
- Files affected:
  - `src/test-utils/api/generators.ts` (2 instances)
  - `src/test-utils/api/mocks.ts` (3 instances)
  - `src/test-utils/api/request.ts` (1 instance)
  - `src/test-utils/api/response.ts` (2 instances)
  - `src/test-utils/mock-factories.ts` (2 instances)

### Import Errors (1 instance)
- `@typescript-eslint/no-require-imports`: Using require() instead of import
- File affected: `src/test-utils/api/mocks.ts`

### Unused Variables/Imports (17 instances)
- `@typescript-eslint/no-unused-vars`: Unused imports and variables
- Files affected:
  - `src/test-utils/api/mocks.ts` (1 instance)
  - `src/__tests__/api/csp-report.test.ts` (1 instance)
  - `src/__tests__/api/feed/category.test.ts` (2 instances)
  - `src/__tests__/api/feed/rss.test.ts` (4 instances)
  - `src/__tests__/api/newsletter/subscribe.test.ts` (3 instances)
  - `src/__tests__/api/newsletter/webhook.test.ts` (1 instance)
  - `src/__tests__/api/preview.test.ts` (3 instances)
  - `src/__tests__/components/blog/RichTextRenderer.test.tsx` (1 instance)
  - `src/__tests__/components/SEO.test.tsx` (1 instance)

## Implementation Steps

### Step 1: Fix `any` Types

1. **generators.ts**
   - Line 14: Define proper type for mock data parameter
   - Line 63: Define proper type for Prismic document

2. **mocks.ts**
   - Line 12: Define type for mock request body
   - Line 13: Define type for mock response
   - Line 14: Define type for headers

3. **request.ts**
   - Line 10: Define proper type for request body

4. **response.ts**
   - Line 7: Define type for response body
   - Line 8: Define type for response init

5. **mock-factories.ts**
   - Line 19: Define type for partial overrides
   - Line 52: Define type for partial text overrides

### Step 2: Fix Import Issues

1. **mocks.ts**
   - Line 42: Convert `require()` to ES module import

### Step 3: Remove Unused Imports/Variables

1. Clean up all unused imports in test files
2. Remove unused variables or use them in tests

## Solution Approach

### Type Definitions

Create proper TypeScript interfaces and types for:
- Mock request/response bodies
- Prismic document structures
- Test data generators
- API response formats

### Import Conversions

Convert CommonJS require to ES modules:
```typescript
// Before
const env = require('./env-mock')

// After
import env from './env-mock'
```

### Unused Variables

Either:
- Remove unused imports if not needed
- Add tests that use the imported functions
- Add ESLint disable comments if imports are needed for setup

## Testing Requirements

- All ESLint errors should be resolved
- No new TypeScript errors introduced
- All tests should continue to pass
- Type safety should be improved

## Success Criteria

- ✅ `npm run lint` passes with no errors or warnings
- ✅ All `any` types replaced with proper types
- ✅ All imports use ES module syntax
- ✅ No unused variables or imports
- ✅ Tests continue to pass

## Dependencies

- Task 24: Fix Jest Test Failures (completed)
- Existing TypeScript configuration

## Notes

- Consider adding ESLint disable comments only as a last resort
- Ensure new types accurately represent the data structures
- Document any complex type definitions for future reference