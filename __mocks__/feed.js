// Mock for the feed package to avoid ESM issues in Jest

class Feed {
  constructor(options) {
    this.options = options
    this.items = []
  }

  addItem(item) {
    this.items.push(item)
  }

  addCategory(category) {
    // Mock implementation
  }

  addContributor(contributor) {
    // Mock implementation
  }

  rss2() {
    return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${this.options.title}</title><description>${this.options.description}</description><link>${this.options.link}</link></channel></rss>`
  }

  atom1() {
    return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${this.options.title}</title><link href="${this.options.link}"/><updated>${new Date().toISOString()}</updated></feed>`
  }

  json1() {
    return JSON.stringify({
      version: 'https://jsonfeed.org/version/1',
      title: this.options.title,
      home_page_url: this.options.link,
      items: this.items.map(item => ({
        id: item.id,
        url: item.link,
        title: item.title,
        content_html: item.content,
        date_published: item.date
      }))
    })
  }
}

module.exports = { Feed }