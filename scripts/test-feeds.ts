#!/usr/bin/env node
import { generateFeeds } from '../src/lib/feed-generator'
import { validateFeed } from '../src/lib/feed-validator'

async function testFeeds() {
  console.log('🚀 Testing feed generation...\n')
  
  try {
    // Generate feeds
    console.log('📝 Generating feeds...')
    const startTime = performance.now()
    const { rss, atom, json } = await generateFeeds()
    const endTime = performance.now()
    
    console.log(`✅ Feeds generated in ${(endTime - startTime).toFixed(2)}ms\n`)
    
    // Check feed sizes
    console.log('📊 Feed sizes:')
    console.log(`  RSS:  ${(new Blob([rss]).size / 1024).toFixed(2)} KB`)
    console.log(`  Atom: ${(new Blob([atom]).size / 1024).toFixed(2)} KB`)
    console.log(`  JSON: ${(new Blob([json]).size / 1024).toFixed(2)} KB\n`)
    
    // Validate feeds
    console.log('🔍 Validating feeds...\n')
    
    // Validate RSS
    console.log('RSS Feed:')
    const rssValidation = await validateFeed(rss, 'rss')
    if (rssValidation.valid) {
      console.log('  ✅ Valid')
    } else {
      console.log('  ❌ Invalid')
      rssValidation.errors.forEach(error => console.log(`    Error: ${error}`))
    }
    if (rssValidation.warnings.length > 0) {
      rssValidation.warnings.forEach(warning => console.log(`    ⚠️  Warning: ${warning}`))
    }
    console.log()
    
    // Validate Atom
    console.log('Atom Feed:')
    const atomValidation = await validateFeed(atom, 'atom')
    if (atomValidation.valid) {
      console.log('  ✅ Valid')
    } else {
      console.log('  ❌ Invalid')
      atomValidation.errors.forEach(error => console.log(`    Error: ${error}`))
    }
    if (atomValidation.warnings.length > 0) {
      atomValidation.warnings.forEach(warning => console.log(`    ⚠️  Warning: ${warning}`))
    }
    console.log()
    
    // Validate JSON
    console.log('JSON Feed:')
    const jsonValidation = await validateFeed(json, 'json')
    if (jsonValidation.valid) {
      console.log('  ✅ Valid')
    } else {
      console.log('  ❌ Invalid')
      jsonValidation.errors.forEach(error => console.log(`    Error: ${error}`))
    }
    if (jsonValidation.warnings.length > 0) {
      jsonValidation.warnings.forEach(warning => console.log(`    ⚠️  Warning: ${warning}`))
    }
    console.log()
    
    // Sample first item from RSS
    console.log('📋 Sample RSS item:')
    const rssMatch = rss.match(/<item>([\s\S]*?)<\/item>/)
    if (rssMatch) {
      console.log(rssMatch[0].substring(0, 500) + '...\n')
    }
    
    // Overall result
    const allValid = rssValidation.valid && atomValidation.valid && jsonValidation.valid
    if (allValid) {
      console.log('✅ All feeds are valid!')
    } else {
      console.log('❌ Some feeds have validation errors')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error testing feeds:', error)
    process.exit(1)
  }
}

// Run the test
testFeeds()