// Simple test to check if feed generation works
const { generateFeeds } = require('./src/lib/feed-generator.ts')

async function test() {
  try {
    console.log('Testing feed generation...')
    const feeds = await generateFeeds()
    console.log('RSS feed length:', feeds.rss.length)
    console.log('Atom feed length:', feeds.atom.length)
    console.log('JSON feed length:', feeds.json.length)
    console.log('✅ Feed generation successful!')
  } catch (error) {
    console.error('❌ Feed generation failed:', error)
  }
}

test()
