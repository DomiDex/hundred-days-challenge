# RSS Feed Quick Start Guide

## For Users

### 🚀 Subscribe in 30 Seconds

1. **Choose your feed format:**
   - 📡 RSS: `https://yourdomain.com/rss.xml`
   - ⚛️ Atom: `https://yourdomain.com/atom.xml`
   - { } JSON: `https://yourdomain.com/feed.json`

2. **Pick a feed reader:**
   - [Feedly](https://feedly.com) - Most popular, great mobile apps
   - [Inoreader](https://inoreader.com) - Power features, rules & filters
   - [NewsBlur](https://newsblur.com) - Open source, AI features
   - [NetNewsWire](https://netnewswire.com) - Native Mac/iOS app

3. **Add the feed URL to your reader**

That's it! You'll now receive all new posts automatically.

### 📱 Mobile Apps

- **iOS**: Reeder, NetNewsWire, Feedly
- **Android**: Feedly, Inoreader, FeedMe

### 📧 Get RSS via Email

Convert RSS to email using:

- [Blogtrottr](https://blogtrottr.com)
- [FeedRabbit](https://feedrabbit.com)

## For Developers

### Quick Integration

```javascript
// Fetch latest posts
const response = await fetch('https://yourdomain.com/feed.json')
const feed = await response.json()

// Display posts
feed.items.forEach((post) => {
  console.log(post.title, post.url)
})
```

### Parse RSS with JavaScript

```javascript
// Using DOMParser
const rssResponse = await fetch('https://yourdomain.com/rss.xml')
const rssText = await rssResponse.text()
const parser = new DOMParser()
const doc = parser.parseFromString(rssText, 'text/xml')

const items = doc.querySelectorAll('item')
items.forEach((item) => {
  const title = item.querySelector('title')?.textContent
  const link = item.querySelector('link')?.textContent
  console.log(title, link)
})
```

### Efficient Polling

```javascript
let lastETag = null

async function checkForUpdates() {
  const response = await fetch('https://yourdomain.com/rss.xml', {
    headers: lastETag ? { 'If-None-Match': lastETag } : {},
  })

  if (response.status === 304) {
    console.log('No new content')
    return
  }

  lastETag = response.headers.get('ETag')
  const content = await response.text()
  // Process new content
}

// Check every 5 minutes
setInterval(checkForUpdates, 5 * 60 * 1000)
```

### WebSub Real-time Updates

```javascript
// Subscribe to WebSub hub
const hubUrl = 'https://pubsubhubbub.appspot.com/'
const topicUrl = 'https://yourdomain.com/rss.xml'
const callbackUrl = 'https://your-server.com/websub-callback'

// Subscribe request
await fetch(hubUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    'hub.mode': 'subscribe',
    'hub.topic': topicUrl,
    'hub.callback': callbackUrl,
  }),
})
```

## Category Feeds

Subscribe to specific topics:

- **Tutorials**: `/feeds/category/tutorials.xml`
- **News**: `/feeds/category/news.xml`
- **Projects**: `/feeds/category/projects.xml`

## Feed Features

- ✅ **Full Content** - Read entire articles in your feed reader
- ✅ **Real-time Updates** - WebSub support for instant notifications
- ✅ **Clean URLs** - No tracking parameters
- ✅ **Images Included** - Featured images in feed items
- ✅ **Fast Loading** - Efficient caching with ETags
- ✅ **Privacy-Focused** - No user tracking

## Troubleshooting

**Feed not showing in reader?**

- Try the Atom feed if RSS doesn't work
- Check if your reader supports HTTPS

**Missing images?**

- Images are included as enclosures
- Some readers hide images by default

**Want only summaries?**

- Currently feeds include full content
- Use your reader's truncation settings

## Share & Promote

```html
<!-- Add to your website -->
<a href="https://yourdomain.com/rss.xml">
  <img src="rss-icon.svg" alt="RSS Feed" />
  Subscribe via RSS
</a>
```

```markdown
<!-- Add to README -->

[![RSS Feed](https://img.shields.io/badge/RSS-Feed-orange)](https://yourdomain.com/rss.xml)
```

## Need Help?

- Test feeds: [W3C Validator](https://validator.w3.org/feed/)
- Report issues: [GitHub Issues](https://github.com/yourrepo/issues)
- Learn more: [RSS Specification](https://www.rssboard.org/rss-specification)
