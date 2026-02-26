import fetch from 'node-fetch'

export async function searchArXiv(query, opts = {}) {
  const limit = opts.limit || 10
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`

  const res = await fetch(url)
  const xml = await res.text()

  // Parse XML entries (lightweight, no dependency)
  const entries = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]
    const title = extract(entry, 'title')?.replace(/\s+/g, ' ').trim()
    const summary = extract(entry, 'summary')?.replace(/\s+/g, ' ').trim()
    const published = extract(entry, 'published')

    // Get link
    const linkMatch = entry.match(/href="(https:\/\/arxiv\.org\/abs\/[^"]+)"/)
    const url = linkMatch ? linkMatch[1] : null

    // Get authors
    const authorRegex = /<author>\s*<name>([^<]+)<\/name>/g
    const authors = []
    let am
    while ((am = authorRegex.exec(entry)) !== null) authors.push(am[1])

    entries.push({
      title,
      url,
      author: authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : ''),
      date: published?.split('T')[0],
      summary: summary?.substring(0, 250),
    })
  }

  return entries
}

function extract(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return match ? match[1] : null
}
