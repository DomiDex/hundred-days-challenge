export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'
  
  const robotsTxt = `User-agent: *
Allow: /

# RSS Feeds - Allow crawling with delay
Allow: /rss.xml
Allow: /atom.xml
Allow: /feed.json
Allow: /feeds/
Crawl-delay: 10

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`
  
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}