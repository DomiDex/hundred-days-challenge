'use client'

import { RSSIcon } from '@/components/svg/RSSIcon'

export function FeedLinks() {
  const feeds = [
    { name: 'RSS', url: '/rss.xml', type: 'application/rss+xml' },
    { name: 'Atom', url: '/atom.xml', type: 'application/atom+xml' },
    { name: 'JSON', url: '/feed.json', type: 'application/feed+json' },
  ]

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <RSSIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Subscribe to Feeds</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Stay updated with our latest posts through your favorite feed reader.
      </p>

      <div className="grid gap-2">
        {feeds.map((feed) => (
          <a
            key={feed.name}
            href={feed.url}
            className="flex items-center justify-between rounded border p-3 transition-colors hover:bg-muted/50"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="font-medium">{feed.name} Feed</span>
            <span className="text-xs text-muted-foreground">{feed.type}</span>
          </a>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          All feeds include full content and support WebSub for real-time updates.
        </p>
      </div>
    </div>
  )
}
