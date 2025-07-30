# Task 07: Implement Unit Tests for Components and Utilities

## Priority: Medium

## Description
Write comprehensive unit tests for all components, hooks, and utility functions to ensure code reliability and achieve 80% coverage target.

## Dependencies
- Task 06: Testing Framework Setup (must be completed)

## Implementation Steps

### 1. **Test Component: AuthorCard**
   - Create `src/__tests__/components/blog/AuthorCard.test.tsx`:
   ```typescript
   - Test rendering with different variants
   - Test with missing avatar
   - Test bio rendering for full variant
   - Test accessibility attributes
   ```

### 2. **Test Component: TableOfContents**
   - Create `src/__tests__/components/blog/TableOfContents.test.tsx`:
   ```typescript
   - Test heading hierarchy rendering
   - Test active section highlighting
   - Test click navigation
   - Test empty headings handling
   ```

### 3. **Test Hook: useTheme**
   - Create `src/__tests__/hooks/useTheme.test.ts`:
   ```typescript
   - Test theme toggling
   - Test system preference detection
   - Test localStorage persistence
   - Test SSR compatibility
   ```

### 4. **Test Utilities: prismic-helpers**
   - Create `src/__tests__/lib/prismic-helpers.test.ts`:
   ```typescript
   - Test getAuthorData with valid/invalid data
   - Test error handling
   - Test data transformation
   - Test edge cases
   ```

### 5. **Test Component: SEO**
   - Create `src/__tests__/components/SEO.test.tsx`:
   ```typescript
   - Test metadata generation
   - Test fallback values
   - Test OpenGraph data
   - Test Twitter card data
   ```

### 6. **Test Component: CategoryChip**
   - Create `src/__tests__/components/blog/CategoryChip.test.tsx`:
   ```typescript
   - Test link generation
   - Test styling
   - Test hover states
   - Test accessibility
   ```

### 7. **Test Utility: toc-utils**
   - Create `src/__tests__/lib/toc-utils.test.ts`:
   ```typescript
   - Test heading extraction
   - Test ID generation
   - Test hierarchy building
   - Test special character handling
   ```

## Test Templates

### Component Test Template
```typescript
import { render, screen } from '@/test-utils'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  it('renders correctly with default props', () => {
    render(<ComponentName />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })
  
  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<ComponentName />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})
```

### Hook Test Template
```typescript
import { renderHook, act } from '@testing-library/react'
import { useHookName } from '@/hooks/useHookName'

describe('useHookName', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useHookName())
    expect(result.current.value).toBe(initialValue)
  })
  
  it('updates state correctly', () => {
    const { result } = renderHook(() => useHookName())
    
    act(() => {
      result.current.updateValue(newValue)
    })
    
    expect(result.current.value).toBe(newValue)
  })
})
```

## Testing Checklist

### Components
- [ ] AuthorCard - all variants tested
- [ ] TableOfContents - interaction tested
- [ ] SEO - metadata generation tested
- [ ] CategoryChip - navigation tested
- [ ] ShareButtons - social links tested
- [ ] RichTextRenderer - content rendering tested

### Hooks
- [ ] useTheme - theme switching tested
- [ ] useTableOfContents - scroll tracking tested
- [ ] useInfiniteScroll - pagination tested

### Utilities
- [ ] prismic-helpers - data extraction tested
- [ ] toc-utils - heading parsing tested
- [ ] validation utilities - input sanitization tested

## Coverage Targets
- Components: 85%+ coverage
- Hooks: 90%+ coverage
- Utilities: 95%+ coverage
- Overall: 80%+ coverage

## Success Criteria
- All critical paths have tests
- Edge cases are covered
- Tests are maintainable and clear
- No flaky tests
- Coverage meets targets
- Tests run quickly (< 30s)