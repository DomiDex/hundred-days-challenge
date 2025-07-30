# Task 01: Add Author Website Link to CMS and UI

## Priority: High

## Description

Add a website link field to the Author content type in Prismic CMS and display it with an appropriate icon on both the author page and author card components in blog posts.

## Dependencies

- None (can be started immediately)

## Implementation Steps

### 1. **Update Prismic Author Content Type**

- Add to `customtypes/author/index.json` after the `github_link` field:

```json
"website_link": {
  "type": "Link",
  "config": {
    "label": "Personal Website",
    "placeholder": "Link to personal website",
    "select": "web",
    "allowTargetBlank": true
  }
}
```

- Push changes to Prismic via Slice Machine UI

### 2. **Create Website Icon Component**

- Create `src/components/svg/WebsiteIcon.tsx`
- Use Globe or Link icon design
- Follow existing icon component patterns

### 3. **Update TypeScript Types**

- Update `src/types/author-types.ts` to include:

```typescript
website_link?: prismic.LinkField;
```

- Regenerate Prismic types if needed

### 4. **Update Author Social Links Component**

- Modify `src/components/blog/AuthorSocialLinks.tsx`:
  - Add `websiteLink` prop
  - Import and use WebsiteIcon
  - Add link rendering logic

### 5. **Update Author Page**

- Modify `src/app/authors/[uid]/page.tsx`:
  - Fetch website_link field
  - Pass to AuthorSocialLinks component

### 6. **Update Author Card**

- Modify `src/components/blog/AuthorCard.tsx`:
  - Accept optional social links display
  - Add social links for full variant

### 7. **Update Blog Post Page**

- Modify `src/app/blog/[category]/[slug]/page.tsx`:
  - Include website_link in fetchLinks
  - Pass to AuthorSocialLinks component

## Testing Checklist

- [ ] Website link field appears in Prismic CMS
- [ ] Website icon displays correctly on author page
- [ ] Website link opens in new tab with rel="noopener noreferrer"
- [ ] Author card on blog posts shows website link
- [ ] All existing functionality remains intact
- [ ] TypeScript types are correctly updated
- [ ] No console errors or warnings

## Success Criteria

- Authors can add their personal website links through Prismic CMS
- Website links are displayed with an appropriate icon alongside other social links
- The implementation maintains consistency with existing UI patterns
- All links are secure and accessible
