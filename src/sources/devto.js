import fetch from 'node-fetch'

export async function searchDevTo(query, opts = {}) {
  const limit = opts.limit || 10
  const url = `https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=${limit}&top=7`

  const res = await fetch(url)

  if (!res.ok) {
    // Fallback: search endpoint
    const searchUrl = `https://dev.to/api/articles?per_page=${limit}&tag=${encodeURIComponent(query.split(' ')[0])}`
    const searchRes = await fetch(searchUrl)
    if (!searchRes.ok) throw new Error(`Dev.to API: ${searchRes.status}`)
    const data = await searchRes.json()
    return mapArticles(data)
  }

  const data = await res.json()
  return mapArticles(data)
}

function mapArticles(articles) {
  if (!Array.isArray(articles)) return []
  return articles.map(a => ({
    title: a.title,
    url: a.url,
    score: a.positive_reactions_count || 0,
    comments: a.comments_count || 0,
    author: a.user?.name || a.user?.username,
    date: a.published_at?.split('T')[0],
    summary: a.description?.substring(0, 200) || null,
  }))
}
