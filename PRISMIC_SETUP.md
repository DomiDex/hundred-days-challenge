# Prismic Blog Setup Guide

This Next.js application is configured with Prismic CMS for blog management. Follow these steps to complete the setup.

## Prerequisites

- A Prismic account (create one at [prismic.io](https://prismic.io))
- Node.js and npm installed

## Setup Steps

### 1. Create a Prismic Repository

1. Log in to your Prismic account
2. Create a new repository
3. Note your repository name

### 2. Update Configuration

Update the `slicemachine.config.json` file with your repository name:

```json
{
  "repositoryName": "your-repo-name",
  "adapter": "@slicemachine/adapter-next",
  "libraries": ["./src/slices"],
  "localSliceSimulatorURL": "http://localhost:3000/slice-simulator"
}
```

### 3. Run Slice Machine

```bash
npm run slicemachine
```

This will open the Slice Machine UI at `http://localhost:9999`.

### 4. Push Custom Types to Prismic

In Slice Machine:

1. Go to the "Custom Types" tab
2. You'll see the following custom types:
   - **Category**: For blog categories
   - **Post**: For blog posts
   - **Homepage**: For the homepage
   - **Page**: For general pages

3. Push each custom type to Prismic by clicking the "Push to Prismic" button

### 5. Push Slices to Prismic

1. Go to the "Slices" tab
2. Push the following slices:
   - **Hero**: For hero sections
   - **RichText**: For rich text content
   - **CodeBlock**: For syntax-highlighted code blocks

## Content Structure

### Category

- **Name**: Category title
- **Slug**: URL-friendly identifier
- **Image**: Category featured image
- **Meta Title**: SEO title
- **Meta Description**: SEO description

### Post

- **Name**: Post title
- **Slug**: URL-friendly identifier
- **Image**: Featured image
- **Meta Title**: SEO title
- **Meta Description**: SEO description
- **Category**: Link to a category
- **Publication Date**: When the post was published
- **Excerpt**: Brief description
- **Article Text**: Main content (rich text with code support)
- **Slices**: Additional content sections

## Features

### Code Highlighting

The blog supports syntax-highlighted code in two ways:

1. **Inline code**: Use the "codespan" label in rich text
2. **Code blocks**: Use the CodeBlock slice for full code examples with:
   - Language selection
   - Optional filename
   - Line numbers
   - Syntax highlighting via Prism.js

### Rich Text Labels

In the Article Text field, you can use:

- `codespan`: For inline code
- `highlight`: For highlighted text

## Creating Content

1. Log in to your Prismic repository
2. Create categories first
3. Create blog posts and link them to categories
4. Use slices to add rich content sections

## Development

```bash
# Run the development server
npm run dev

# Run Slice Machine
npm run slicemachine
```

## Environment Variables

Create a `.env.local` file if you need to add:

```env
# Optional: For preview functionality
PRISMIC_PREVIEW_SECRET=your-preview-secret
```

## URLs

- Blog listing: `/blog`
- Category page: `/blog/[category-slug]`
- Blog post: `/blog/[category-slug]/[post-slug]`

## Customization

- Modify slices in `/src/slices/`
- Update blog components in `/src/components/blog/`
- Customize styles in the component files or global CSS
