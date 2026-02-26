import fetch from 'node-fetch'

export async function searchYouTube(query, opts = {}) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY nao configurada')

  const limit = opts.limit || 10
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&maxResults=${limit}&q=${encodeURIComponent(query)}&key=${apiKey}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) throw new Error(`YouTube API: ${data.error.message}`)
  if (!data.items) return []

  return data.items.map(item => ({
    title: item.snippet.title,
    url: `https://youtube.com/watch?v=${item.id.videoId}`,
    author: item.snippet.channelTitle,
    date: item.snippet.publishedAt?.split('T')[0],
    summary: item.snippet.description?.substring(0, 200) || null,
  }))
}
