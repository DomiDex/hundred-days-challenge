interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export async function validateFeed(
  feedContent: string,
  type: 'rss' | 'atom' | 'json'
): Promise<ValidationResult> {
  switch (type) {
    case 'rss':
    case 'atom':
      return validateXMLFeed(feedContent, type)
    case 'json':
      return validateJSONFeed(feedContent)
  }
}

async function validateXMLFeed(content: string, type: 'rss' | 'atom'): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Basic XML validation
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/xml')

    // Check for XML parsing errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      errors.push(`XML parsing failed: ${parserError.textContent}`)
      return { valid: false, errors, warnings }
    }

    // RSS specific validation
    if (type === 'rss') {
      const channel = doc.querySelector('channel')
      if (!channel) {
        errors.push('Missing required <channel> element')
      } else {
        // Check required RSS channel elements
        const requiredElements = ['title', 'link', 'description']
        for (const element of requiredElements) {
          if (!channel.querySelector(element)) {
            errors.push(`Missing required channel element: <${element}>`)
          }
        }

        // Check items
        const items = channel.querySelectorAll('item')
        if (items.length === 0) {
          warnings.push('No items found in feed')
        } else {
          items.forEach((item, index) => {
            // Each item should have title or description
            if (!item.querySelector('title') && !item.querySelector('description')) {
              errors.push(`Item ${index + 1} missing both title and description`)
            }

            // Check for guid
            const guid = item.querySelector('guid')
            if (!guid) {
              warnings.push(`Item ${index + 1} missing guid element`)
            }

            // Check for pubDate
            if (!item.querySelector('pubDate')) {
              warnings.push(`Item ${index + 1} missing pubDate`)
            }
          })
        }
      }
    }

    // Atom specific validation
    if (type === 'atom') {
      const feed = doc.querySelector('feed')
      if (!feed) {
        errors.push('Missing required <feed> element')
      } else {
        // Check required Atom feed elements
        const requiredElements = ['title', 'id', 'updated']
        for (const element of requiredElements) {
          if (!feed.querySelector(element)) {
            errors.push(`Missing required feed element: <${element}>`)
          }
        }

        // Check entries
        const entries = feed.querySelectorAll('entry')
        if (entries.length === 0) {
          warnings.push('No entries found in feed')
        } else {
          entries.forEach((entry, index) => {
            // Check required entry elements
            const entryRequired = ['title', 'id', 'updated']
            for (const element of entryRequired) {
              if (!entry.querySelector(element)) {
                errors.push(`Entry ${index + 1} missing required element: <${element}>`)
              }
            }

            // Check for content or summary
            if (!entry.querySelector('content') && !entry.querySelector('summary')) {
              warnings.push(`Entry ${index + 1} missing both content and summary`)
            }
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
    }
  }
}

function validateJSONFeed(content: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const feed = JSON.parse(content)

    // Check JSON Feed version
    if (!feed.version) {
      errors.push('Missing required field: version')
    } else if (!feed.version.startsWith('https://jsonfeed.org/version/1')) {
      errors.push(`Invalid version: ${feed.version}`)
    }

    // Check required fields
    const requiredFields = ['title', 'items']
    for (const field of requiredFields) {
      if (!feed[field]) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    // Validate items
    if (Array.isArray(feed.items)) {
      if (feed.items.length === 0) {
        warnings.push('No items found in feed')
      } else {
        feed.items.forEach((item: unknown, index: number) => {
          const feedItem = item as Record<string, unknown>
          // Check required item fields
          if (!feedItem.id) {
            errors.push(`Item ${index + 1} missing required field: id`)
          }

          // Must have content_html or content_text
          if (!feedItem.content_html && !feedItem.content_text) {
            errors.push(`Item ${index + 1} missing both content_html and content_text`)
          }

          // Check for dates
          if (!feedItem.date_published) {
            warnings.push(`Item ${index + 1} missing date_published`)
          }
        })
      }
    } else if (feed.items) {
      errors.push('Items field must be an array')
    }

    // Check feed_url if present
    if (feed.feed_url && !isValidUrl(feed.feed_url)) {
      warnings.push(`Invalid feed_url: ${feed.feed_url}`)
    }

    // Check home_page_url if present
    if (feed.home_page_url && !isValidUrl(feed.home_page_url)) {
      warnings.push(`Invalid home_page_url: ${feed.home_page_url}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
    }
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
