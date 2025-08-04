import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
// import { headers } from 'next/headers' // Removed to fix DYNAMIC_SERVER_USAGE
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ThemeProvider from '@/components/providers/ThemeProvider'
import GSAPProvider from '@/components/providers/GSAPProvider'
import { NonceProvider } from '@/components/providers/NonceProvider'
import { SkipNavigation } from '@/components/SkipNavigation'
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
})

export const metadata: Metadata = {
  title: 'A daily Next.js coding challenge | A dayly Next.js',
  description:
    'Practicing Next.js by building a daily coding challenge project every day for 100 days.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'
  // Remove headers() call to fix DYNAMIC_SERVER_USAGE error
  // Nonce is not currently used since middleware is disabled
  const nonce = ''

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="theme-color" content="#8B5CF6" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://images.prismic.io" />
        <link rel="dns-prefetch" href="https://images.prismic.io" />
        <link rel="preconnect" href="https://hundred-days-challenge.cdn.prismic.io" />
        <link rel="dns-prefetch" href="https://hundred-days-challenge.cdn.prismic.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme-storage');
                  if (theme) {
                    const parsed = JSON.parse(theme);
                    const userTheme = parsed.state?.theme || 'system';
                    
                    if (userTheme === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      document.documentElement.classList.add(systemTheme);
                    } else {
                      document.documentElement.classList.add(userTheme);
                    }
                  } else {
                    // Default to system preference
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.documentElement.classList.add(systemTheme);
                  }
                } catch (e) {
                  // Fallback to light mode
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        {/* Primary RSS feed - most compatible */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - RSS Feed"
          href="/rss.xml"
        />
        {/* Atom feed - modern standard */}
        <link
          rel="alternate"
          type="application/atom+xml"
          title="100 Days of Craft - Atom Feed"
          href="/atom.xml"
        />
        {/* JSON feed - developer-friendly */}
        <link
          rel="alternate"
          type="application/feed+json"
          title="100 Days of Craft - JSON Feed"
          href="/feed.json"
        />
        {/* WebSub hub discovery */}
        <link rel="hub" href="https://pubsubhubbub.appspot.com/" />
        {/* Self reference for WebSub */}
        <link rel="self" type="application/rss+xml" href={`${siteUrl}/rss.xml`} />

        {/* Enhanced feed discovery for better SEO */}
        {/* Category-specific feeds for targeted subscription */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - Tutorials"
          href="/feeds/category/tutorials.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - News & Updates"
          href="/feeds/category/news.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - Projects"
          href="/feeds/category/projects.xml"
        />

        {/* OpenSearch for feed discovery */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="100 Days of Craft"
          href="/opensearch.xml"
        />

        {/* Additional metadata for feed readers and discovery */}
        <meta name="feed:rss" content={`${siteUrl}/rss.xml`} />
        <meta name="feed:atom" content={`${siteUrl}/atom.xml`} />
        <meta name="feed:json" content={`${siteUrl}/feed.json`} />

        {/* Syndication metadata */}
        <meta name="syndication-source" content={siteUrl} />
        <meta name="original-source" content={siteUrl} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NonceProvider nonce={nonce}>
          <ThemeProvider>
            <GSAPProvider>
              <SkipNavigation />
              <Header />
              <main id="main-content" tabIndex={-1} className="focus:outline-none">
                {children}
              </main>
              <Footer />
            </GSAPProvider>
          </ThemeProvider>
        </NonceProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
