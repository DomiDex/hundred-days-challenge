# Favicon Troubleshooting Guide

Your favicon is located at `src/app/favicon.ico` which is the correct location for Next.js 13+ App Router.

## Common Issues & Solutions

### 1. Browser Cache

**Most common issue!** Browsers aggressively cache favicons.

**Solutions:**

- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Open in Incognito/Private window
- Clear browser cache completely
- Add a query string to force refresh: Visit `http://localhost:3000/favicon.ico?v=2`

### 2. Development Server

Sometimes the dev server doesn't serve the favicon correctly.

**Solutions:**

```bash
# Restart the dev server
npm run dev

# Or try building and running production
npm run build
npm run start
```

### 3. Check if Favicon is Accessible

Visit directly: `http://localhost:3000/favicon.ico`

- If you see the icon, it's being served correctly
- If you get 404, there's a serving issue

### 4. Add Explicit Link Tag (Optional)

If automatic detection isn't working, add to your `layout.tsx`:

```tsx
// In src/app/layout.tsx, inside the <head> tag
<link rel="icon" href="/favicon.ico" sizes="any" />
```

### 5. Multiple Icon Formats (Recommended)

For better browser support, you can add multiple formats:

1. Create `src/app/icon.png` (32x32 or larger)
2. Create `src/app/apple-icon.png` (180x180 for Apple devices)

Next.js will automatically use these files.

### 6. Check Console

Open DevTools (F12) and check:

- Network tab: Look for favicon.ico request
- Console: Any errors loading the favicon

### 7. File Size

Your favicon is 41KB which is fine, but if you want to optimize:

- Use online tools to reduce ICO file size
- Convert to PNG format (usually smaller)

## Quick Test

1. Open Chrome Incognito window
2. Go to `http://localhost:3000`
3. Press `Ctrl+Shift+R`
4. Check the browser tab

If still not showing, try accessing the favicon directly at `http://localhost:3000/favicon.ico` to ensure it's being served.
