import { Metadata } from 'next'
import { SmartFeedWidget } from '@/components/feed/SmartFeedWidget'
import { Rss, CheckCircle2, Shield, Zap, Bell } from 'lucide-react'
import Script from 'next/script'
import { generateFeedStructuredData } from '@/lib/feed-seo-optimizer'
import { headers } from 'next/headers'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

export const metadata: Metadata = {
  title: 'Subscribe to 100 Days of Craft - RSS, Atom & JSON Feeds',
  description:
    'Follow 100 Days of Craft through RSS, Atom, or JSON feeds. Get instant updates on new posts without algorithms or tracking.',
  openGraph: {
    title: 'Subscribe to 100 Days of Craft',
    description: 'Follow our journey through RSS feeds - no algorithms, no tracking, just content.',
  },
}

export default async function SubscribePage() {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') || ''
  const benefits = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Privacy First',
      description:
        'No accounts, no tracking, no data collection. Your reading habits stay private.',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Real-time Updates',
      description: 'Get notified instantly when new content is published via WebSub.',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Never Miss a Post',
      description: 'No algorithms deciding what you see. Get every single update.',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: 'Works Offline',
      description: 'Once synced, read your feeds anywhere, even without internet.',
    },
  ]

  const feedFormats = [
    {
      name: 'RSS 2.0',
      url: '/rss.xml',
      description: 'Most widely supported format',
      icon: '📡',
    },
    {
      name: 'Atom 1.0',
      url: '/atom.xml',
      description: 'Modern feed standard',
      icon: '⚛️',
    },
    {
      name: 'JSON Feed',
      url: '/feed.json',
      description: 'Developer-friendly format',
      icon: '{ }',
    },
  ]

  const categoryFeeds = [
    { name: 'Tutorials', slug: 'tutorials' },
    { name: 'News & Updates', slug: 'news' },
    { name: 'Projects', slug: 'projects' },
  ]

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Rss className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">Subscribe to 100 Days of Craft</h1>
        <p className="text-xl text-muted-foreground">
          Follow our journey through RSS feeds. No algorithms, no accounts, just content.
        </p>
      </div>

      {/* Quick Subscribe Widget */}
      <div className="mb-12">
        <SmartFeedWidget className="mx-auto max-w-2xl" />
      </div>

      {/* Benefits Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Why RSS?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 text-primary">{benefit.icon}</div>
              <div>
                <h3 className="mb-1 font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feed Formats */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Choose Your Format</h2>
        <div className="grid gap-4">
          {feedFormats.map((format) => (
            <div
              key={format.name}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{format.icon}</span>
                  <div>
                    <h3 className="font-semibold">{format.name}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">{format.description}</p>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {siteUrl}
                      {format.url}
                    </code>
                  </div>
                </div>
                <a
                  href={format.url}
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Subscribe
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Feeds */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Category-Specific Feeds</h2>
        <p className="mb-4 text-muted-foreground">
          Only interested in specific topics? Subscribe to individual categories:
        </p>
        <div className="grid gap-3">
          {categoryFeeds.map((category) => (
            <div
              key={category.slug}
              className="flex items-center justify-between rounded border p-3"
            >
              <span className="font-medium">{category.name}</span>
              <a
                href={`/feeds/category/${category.slug}.xml`}
                className="text-sm text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscribe to {category.name}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* How-to Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">How to Subscribe</h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <ol className="space-y-2">
            <li>Choose a feed reader from the widget above or use your favorite RSS app</li>
            <li>Copy the feed URL (RSS, Atom, or JSON)</li>
            <li>Add it to your feed reader</li>
            <li>That&apos;s it! You&apos;ll receive updates automatically</li>
          </ol>
          <p className="mt-4">
            <strong>Pro tip:</strong> Most modern browsers can detect our feeds automatically. Look
            for the RSS icon in your browser&apos;s address bar or use browser extensions like
            Feedbro or RSS Feed Reader.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">What is RSS?</summary>
            <p className="mt-2 text-sm text-muted-foreground">
              RSS (Really Simple Syndication) is a web feed format that allows users and
              applications to access updates to websites in a standardized, computer-readable
              format. It&apos;s like having websites deliver content to you instead of you visiting
              them.
            </p>
          </details>
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">
              Which feed format should I choose?
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              For most users, RSS 2.0 is the best choice as it&apos;s the most widely supported. If
              your reader supports it, Atom is more modern. JSON Feed is great for developers who
              want to parse feeds programmatically.
            </p>
          </details>
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">Do I need an account?</summary>
            <p className="mt-2 text-sm text-muted-foreground">
              No! That&apos;s the beauty of RSS. You don&apos;t need to create an account, provide
              an email, or share any personal information. Just add our feed URL to your reader and
              you&apos;re done.
            </p>
          </details>
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">How often are feeds updated?</summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Our feeds update instantly when new content is published. We also support WebSub
              (formerly PubSubHubbub) for real-time push notifications to compatible readers.
            </p>
          </details>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <Script
        id="feed-structured-data"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFeedStructuredData(siteUrl)),
        }}
      />
    </main>
  )
}
