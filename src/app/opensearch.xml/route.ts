export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  const opensearchXml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>100 Days of Craft</ShortName>
  <Description>Search 100 Days of Craft blog posts</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${siteUrl}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${siteUrl}/search?q={searchTerms}"/>
  <Url type="application/rss+xml" rel="self" template="${siteUrl}/rss.xml"/>
  <Url type="application/atom+xml" rel="self" template="${siteUrl}/atom.xml"/>
  <Url type="application/json" rel="self" template="${siteUrl}/feed.json"/>
  <moz:SearchForm>${siteUrl}/search</moz:SearchForm>
</OpenSearchDescription>`

  return new Response(opensearchXml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
