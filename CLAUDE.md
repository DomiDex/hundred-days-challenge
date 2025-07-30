# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 blog application integrated with Prismic CMS, featuring:
- Modern App Router architecture with Server Components
- Blog functionality with categories, posts, and authors
- Dark mode support with Zustand state management
- GSAP animations
- Syntax highlighting with PrismJS
- Tailwind CSS with custom theme variables

## Common Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run Next.js linting

# Prismic Development
npm run slicemachine # Start Slice Machine UI for content modeling
```

## High-Level Architecture

### Content Management System (Prismic)
- **Repository**: `hundred-days-challenge`
- **Content Types**: Homepage, Page, Post, Category, Author
- **Routing**: Configured in `prismicio.ts` with clean URL patterns
- **Preview Support**: API routes at `/api/preview` and `/api/exit-preview`
- **Caching Strategy**: Force-cache in production, 5-second revalidation in development

### Application Structure
- **App Router**: All pages in `/src/app/` using file-based routing
- **Dynamic Routes**:
  - `[uid]` - Generic pages
  - `blog/[category]/[slug]` - Blog posts
  - `authors/[uid]` - Author profiles
- **Slices**: Reusable content blocks in `/src/slices/` (Hero, RichText, CodeBlock)
- **Components**: Organized by feature in `/src/components/`

### State Management
- **Global State**: Zustand store in `/src/store/themeStore.ts` for theme management
- **Context Providers**: Theme and GSAP providers wrap the application
- **Server State**: Managed through Prismic client with Next.js caching

### Styling Architecture
- **Tailwind CSS**: Utility-first with custom Lochinvar color palette
- **CSS Variables**: Theme tokens defined in `globals.css`
- **Dark Mode**: Class-based strategy with system preference support
- **Component Styling**: Using `cn()` utility from `/src/lib/utils.ts` for conditional classes

### Key Integration Points
- **Prismic Helpers**: Utility functions in `/src/lib/prismic-helpers.ts` and `prismic-utils.ts`
- **Rich Text Rendering**: Custom renderer with code block support
- **SEO Component**: Handles metadata generation with Prismic data
- **Image Optimization**: Next.js Image component with Prismic imgix integration

### Development Workflow
1. Use Slice Machine UI to modify content models
2. Changes to slices are reflected in `/src/slices/`
3. Custom types are stored in `/customtypes/`
4. Preview mode allows real-time content updates
5. Git workflow tracks changes to content models

## Important Notes

- All Prismic content fetching happens server-side in page components
- The application uses React 19 with Next.js 15 (latest versions)
- No test framework is currently configured
- TypeScript strict mode is enabled
- Path alias `@/*` maps to `./src/*`

## GSAP React TypeScript Rules and Best Practices

### Key Principles
- Always use `useGSAP()` for GSAP animations
- Properly type and scope animations
- Implement comprehensive cleanup
- Optimize for performance
- Create reusable animation utilities

### Reference Guidelines
For comprehensive GSAP integration rules, see the extensive guidelines which cover:
- Hooks and Refs management
- Performance optimization
- TypeScript typing
- Animation techniques
- Plugin usage
- Debugging strategies

These guidelines provide a robust framework for implementing GSAP animations in React applications with TypeScript.

## Prismic Integration Rules and Best Practices

### Core Principles for Prismic and React Integration
- Always use generated TypeScript types from Prismic
- Implement type-safe content fetching
- Create robust error handling for content rendering
- Optimize performance with efficient queries
- Use Prismic's built-in components and utilities
- Implement comprehensive previews and content modeling

### Key Guidelines
1. **Type Your Content**: Always use `@prismicio/client` generated types
2. **Safe Content Rendering**: Handle empty or missing fields gracefully
3. **Performance First**: Fetch only required fields
4. **Error Boundaries**: Wrap slice components for resilience
5. **Preview Support**: Configure preview routes and exit preview
6. **Localization**: Support multi-language content

### Recommended Tools and Libraries
- `@prismicio/client`: Type-safe content fetching
- `@prismicio/react`: React components for content rendering
- `@prismicio/next`: Next.js specific integrations
- Slice Machine: Content modeling and development

These Prismic integration guidelines ensure type-safe, performant, and flexible content management in your React application.