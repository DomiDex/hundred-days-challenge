'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCircle2, Info, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedFormat {
  type: string
  url: string
  icon: string
}

interface PopularReader {
  name: string
  url: (feedUrl: string) => string
  description: string
}

export function SmartFeedWidget({ className }: { className?: string }) {
  const [userAgent, setUserAgent] = useState('')
  const [showEducation, setShowEducation] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [expandedFormat, setExpandedFormat] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    // Detect if user has RSS reader
    const hasRSSReader = navigator.userAgent.match(/Feedly|Inoreader|NewsBlur|Reeder/i)
    setUserAgent(hasRSSReader ? 'reader-detected' : 'no-reader')

    // Set origin after mount
    setOrigin(window.location.origin)
  }, [])

  const feedFormats: FeedFormat[] = [
    { type: 'RSS', url: '/rss.xml', icon: '📡' },
    { type: 'Atom', url: '/atom.xml', icon: '⚛️' },
    { type: 'JSON', url: '/feed.json', icon: '{ }' },
  ]

  const popularReaders: PopularReader[] = [
    {
      name: 'Feedly',
      url: (feedUrl) => `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`,
      description: 'Most popular, great mobile apps',
    },
    {
      name: 'Inoreader',
      url: (feedUrl) => `https://www.inoreader.com/search/feeds/${encodeURIComponent(feedUrl)}`,
      description: 'Power user features, rules & filters',
    },
    {
      name: 'NewsBlur',
      url: (feedUrl) => `https://newsblur.com/?url=${encodeURIComponent(feedUrl)}`,
      description: 'AI-powered, open source option',
    },
    {
      name: 'Browser Extension',
      url: () => 'https://github.com/RSS-Bridge/rss-bridge',
      description: 'Works with any website',
    },
  ]

  const handleSubscribe = (reader: PopularReader, feedUrl: string) => {
    // In production, track this with analytics
    console.log('Feed subscription clicked:', {
      reader: reader.name,
      feed_format: feedUrl.includes('atom') ? 'atom' : feedUrl.includes('json') ? 'json' : 'rss',
    })
    window.open(reader.url(feedUrl), '_blank')
  }

  const handleCopyUrl = async (url: string) => {
    const fullUrl = `${origin}${url}`
    await navigator.clipboard.writeText(fullUrl)
    setCopiedUrl(url)
    // Track copy action
    console.log('Feed URL copied:', { format: url })

    setTimeout(() => {
      setCopiedUrl(null)
    }, 2000)
  }

  // Don't render until we have the origin to avoid SSR issues
  if (!origin) {
    return (
      <div className={cn('space-y-4 rounded-lg border bg-card p-6', className)}>
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/3 rounded bg-muted"></div>
          <div className="h-4 w-2/3 rounded bg-muted"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Rss className="h-5 w-5" />
          Subscribe to Updates
        </h3>
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          What&apos;s RSS? <Info className="h-4 w-4" />
        </button>
      </div>

      {showEducation && (
        <div className="animate-in slide-in-from-top-2 rounded bg-muted/50 p-4 text-sm">
          <p className="mb-2">
            RSS lets you follow websites without algorithms or accounts. Your reader app checks for
            updates and notifies you of new content.
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>No tracking or privacy concerns</li>
            <li>Works offline once synced</li>
            <li>Combine all your favorite sites</li>
            <li>No missed content or algorithm filtering</li>
          </ul>
        </div>
      )}

      {/* Quick subscribe for detected readers */}
      {userAgent === 'reader-detected' && (
        <button
          onClick={() => (window.location.href = '/rss.xml')}
          className="w-full rounded bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open in Your RSS Reader
        </button>
      )}

      {/* Reader selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Choose your reader:</p>
        {popularReaders.map((reader) => (
          <button
            key={reader.name}
            onClick={() => handleSubscribe(reader, `${origin}/rss.xml`)}
            className="w-full rounded border p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
          >
            <div className="font-medium">{reader.name}</div>
            <div className="text-xs text-muted-foreground">{reader.description}</div>
          </button>
        ))}
      </div>

      {/* Direct feed URLs */}
      <details className="text-sm" open={expandedFormat}>
        <summary
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.preventDefault()
            setExpandedFormat(!expandedFormat)
          }}
        >
          Advanced: Copy feed URL
        </summary>
        <div className="mt-2 space-y-2">
          {feedFormats.map((format) => (
            <div key={format.type} className="flex items-center gap-2">
              <span className="text-lg">{format.icon}</span>
              <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-xs">
                {origin}
                {format.url}
              </code>
              <button
                onClick={() => handleCopyUrl(format.url)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {copiedUrl === format.url ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
