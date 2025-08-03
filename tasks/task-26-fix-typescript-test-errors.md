# Task 26: Fix TypeScript Test Errors

## Overview

Fix TypeScript errors in test files that are preventing successful compilation. These errors include incorrect import names, missing exports, type mismatches, and incorrect module paths.

## Current Status

**Status**: Partially Complete  
**Priority**: High  
**Estimated Time**: 1-2 hours  
**Actual Time**: 1 hour

## Progress Made

### Completed:

- ✅ Fixed incorrect import names (generateAuthToken → generateTestToken, etc.)
- ✅ Added missing exports to security-monitoring module
- ✅ Fixed Request to NextRequest type incompatibilities
- ✅ Fixed NODE_ENV read-only property assignments
- ✅ Fixed module import path for prismicio-types

### Remaining Issues:

- ⚠️ Type mismatches in mock data structures (PostDocument, CategoryDocument, AuthorDocument)
- ⚠️ Null values not assignable to required fields in Prismic types

## Problem Description

Running `npx tsc` reveals 17 TypeScript errors across 7 test files:

### 1. Incorrect Import Names (8 errors)

- `generateAuthToken` should be `generateTestToken`
- `generateMockPost` should be `createMockPost`
- `generateMockCategory` should be `createMockCategory`
- `generateMockAuthor` should be `createMockAuthor`
- Missing exports from `@/lib/security-monitoring`:
  - `getFailedLoginAttempts`
  - `getCSPViolations`
  - `getRateLimitHits`
  - `getSecurityEvents`

### 2. Type Incompatibilities (4 errors)

- `Request` type not assignable to `NextRequest` in:
  - `csp-report.test.ts` (line 199)
  - `revalidate.test.ts` (line 356)
- `RequestInit` signal property incompatibility in `request.ts`

### 3. Read-only Property Assignments (4 errors)

- Cannot assign to `process.env.NODE_ENV` in:
  - `csp-report.test.ts` (lines 305, 309)
  - `preview.test.ts` (lines 100, 216, 249)

### 4. Module Import Errors (1 error)

- Cannot find module `../../../../prismicio-types` in `mocks.ts`

## Implementation Steps

### Step 1: Fix Import Names

1. **security-metrics.test.ts**

   ```typescript
   // Change
   generateAuthToken → generateTestToken
   ```

2. **posts.test.ts**
   ```typescript
   // Change
   generateMockPost → createMockPost
   generateMockCategory → createMockCategory
   generateMockAuthor → createMockAuthor
   ```

### Step 2: Add Missing Security Monitoring Exports

1. Check if these functions exist in `@/lib/security-monitoring`
2. If they exist, export them
3. If they don't exist, either:
   - Create mock implementations
   - Remove the imports and update tests

### Step 3: Fix Type Incompatibilities

1. **For Request to NextRequest conversion**
   - Use `createMockRequest` helper instead of raw Request
   - Ensure the mock request has all NextRequest properties

2. **For RequestInit signal property**
   ```typescript
   // In request.ts, fix the init object
   const init: RequestInit = {
     method,
     headers: requestHeaders,
     signal: undefined, // Explicitly set to undefined instead of allowing null
   }
   ```

### Step 4: Fix NODE_ENV Assignments

Replace direct assignments with proper test environment setup:

```typescript
// Instead of:
process.env.NODE_ENV = 'production'

// Use:
const originalEnv = process.env.NODE_ENV
beforeEach(() => {
  process.env = { ...process.env, NODE_ENV: 'production' }
})
afterEach(() => {
  process.env.NODE_ENV = originalEnv
})
```

### Step 5: Fix Module Import Path

1. **In mocks.ts**

   ```typescript
   // Change from:
   import type { PostDocument, CategoryDocument, AuthorDocument } from '../../../../prismicio-types'

   // To:
   import type { PostDocument, CategoryDocument, AuthorDocument } from '@/prismicio-types'
   ```

## Testing Requirements

- All TypeScript errors should be resolved
- `npx tsc` should complete without errors
- All tests should continue to pass
- No runtime errors introduced

## Success Criteria

- ✅ `npx tsc` passes with no errors
- ✅ All test imports are correctly named
- ✅ All type incompatibilities resolved
- ✅ Environment variable handling is proper
- ✅ Module paths are correct
- ✅ Tests continue to pass

## Dependencies

- Task 24: Fix Jest Test Failures (completed)
- Task 25: Fix ESLint Errors (related but independent)

## Notes

- Some errors might require creating additional mock functions
- Environment variable handling in tests should use proper patterns
- Consider adding type guards for Request/NextRequest conversions
- Document any workarounds for future reference
