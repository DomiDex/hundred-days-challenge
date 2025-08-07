import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wwww.100daysofcraft.com'

  const opensearchXml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>100 Days of Craft</ShortName>
  <Description>Search 100 Days of Craft blog posts about web development, design, and digital craftsmanship</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${siteUrl}/favicon.ico</Image>
  <Image width="32" height="32" type="image/x-icon">${siteUrl}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${siteUrl}/search?q={searchTerms}"/>
  <Url type="application/rss+xml" 
       rel="results" 
       template="${siteUrl}/rss.xml"
       title="100 Days of Craft RSS Feed"/>
  <Url type="application/atom+xml" 
       rel="results" 
       template="${siteUrl}/atom.xml"
       title="100 Days of Craft Atom Feed"/>
  <Url type="application/json" 
       rel="results" 
       template="${siteUrl}/feed.json"
       title="100 Days of Craft JSON Feed"/>
  <Query role="example" searchTerms="javascript"/>
  <Query role="example" searchTerms="react"/>
  <Query role="example" searchTerms="nextjs"/>
  <Developer>100 Days of Craft Team</Developer>
  <Contact>noreply@100daysofcraft.com</Contact>
  <Tags>blog development design web javascript react nextjs typescript</Tags>
  <LongName>100 Days of Craft - Web Development Blog</LongName>
  <Language>en-US</Language>
  <OutputEncoding>UTF-8</OutputEncoding>
  <AdultContent>false</AdultContent>
  <moz:SearchForm>${siteUrl}/search</moz:SearchForm>
</OpenSearchDescription>`

  return new NextResponse(opensearchXml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
