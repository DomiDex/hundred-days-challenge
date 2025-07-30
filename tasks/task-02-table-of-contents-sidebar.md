# Task 02: Implement Responsive Table of Contents Sidebar

## Priority: High

## Description

Create a responsive table of contents (ToC) sidebar that displays on the right side of blog posts, automatically generating navigation links from article headings with scroll tracking and smooth navigation.

## Dependencies

- Task 01: Author Website Link (can work in parallel)

## Implementation Steps

### 1. **Create Heading Extraction Utility**

- Create `src/lib/toc-utils.ts`:

```typescript
- Extract headings from Prismic RichText field
- Generate unique IDs for each heading
- Build hierarchical structure (h2, h3, etc.)
- Handle special characters in IDs
```

### 2. **Create Table of Contents Hook**

- Create `src/hooks/useTableOfContents.ts`:

```typescript
- Use IntersectionObserver for scroll tracking
- Track active section based on viewport
- Handle smooth scrolling to sections
- Clean up observers on unmount
```

### 3. **Create ToC Component**

- Create `src/components/blog/TableOfContents.tsx`:

```typescript
interface Props {
  headings: ToCHeading[]
  activeId: string
}
```

- Implement sticky positioning
- Add smooth scroll behavior
- Show active section highlighting
- Include collapsible sub-sections

### 4. **Update Blog Post Layout**

- Modify `src/app/blog/[category]/[slug]/page.tsx`:

```typescript
- Extract headings from article_text
- Add ToC component to layout
- Implement responsive grid layout
- Hide ToC on mobile (< 1280px)
```

### 5. **Add ID Generation to RichTextRenderer**

- Modify `src/components/blog/RichTextRenderer.tsx`:

```typescript
- Add IDs to all heading elements
- Ensure IDs match ToC generation
- Maintain existing functionality
```

### 6. **Style Implementation**

- Add responsive styles:

```css
- Sticky positioning (top: 6rem)
- Max height with scrollbar
- Smooth transitions for active states
- Mobile-first responsive design
```

### 7. **Performance Optimization**

- Implement debounced scroll handling
- Use React.memo for ToC component
- Lazy load for better initial paint

## Component Structure

```
components/
  blog/
    TableOfContents.tsx      # Main ToC component
    TableOfContentsItem.tsx  # Individual ToC item
hooks/
  useTableOfContents.ts      # Scroll tracking hook
lib/
  toc-utils.ts              # Heading extraction utilities
```

## Testing Checklist

- [ ] ToC generates correctly from article headings
- [ ] Scroll tracking highlights current section
- [ ] Clicking ToC links smoothly scrolls to sections
- [ ] Sticky positioning works correctly
- [ ] ToC is hidden on mobile devices
- [ ] Performance is smooth with long articles
- [ ] Nested headings display correctly
- [ ] Special characters in headings are handled

## Success Criteria

- Table of contents automatically generates from article headings
- Current section is highlighted during scrolling
- Smooth navigation between sections
- Responsive design that hides on mobile
- No performance impact on page load
- Accessible keyboard navigation
- Works with existing Prismic content structure
