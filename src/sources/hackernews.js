import fetch from 'node-fetch'

export async function searchHackerNews(query, opts = {}) {
  const limit = opts.limit || 10
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.hits) return []

  return data.hits.map(hit => ({
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    score: hit.points,
    comments: hit.num_comments,
    author: hit.author,
    date: hit.created_at?.split('T')[0],
    summary: null,
  }))
}
