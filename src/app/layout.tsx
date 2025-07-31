import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ThemeProvider from '@/components/providers/ThemeProvider'
import GSAPProvider from '@/components/providers/GSAPProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'A daily Next.js coding challenge | A dayly Next.js',
  description:
    'Practicing Next.js by building a daily coding challenge project every day for 100 days.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
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
        <link
          rel="hub"
          href="https://pubsubhubbub.appspot.com/"
        />
        {/* Self reference for WebSub */}
        <link
          rel="self"
          type="application/rss+xml"
          href={`${siteUrl}/rss.xml`}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <GSAPProvider>
            <Header />
            {children}
            <Footer />
          </GSAPProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
