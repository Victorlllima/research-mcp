import fetch from 'node-fetch'

const DEFAULT_SUBS = ['artificial', 'MachineLearning', 'LocalLLaMA', 'SideProject', 'Entrepreneur', 'startups', 'webdev', 'nextjs', 'node']

let accessToken = null
let tokenExpiry = 0

async function getToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken

  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('REDDIT_CLIENT_ID e REDDIT_CLIENT_SECRET nao configurados')

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'research-mcp/0.1.0',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!data.access_token) throw new Error(`Reddit auth falhou: ${JSON.stringify(data)}`)

  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return accessToken
}

export async function searchReddit(query, opts = {}) {
  const token = await getToken()
  const subs = opts.subreddits || DEFAULT_SUBS
  const timeframe = opts.timeframe || 'week'
  const sort = opts.sort || 'relevance'
  const limit = opts.limit || 10

  const subredditStr = subs.join('+')
  const url = `https://oauth.reddit.com/r/${subredditStr}/search?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeframe}&limit=${limit}&restrict_sr=on`

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'research-mcp/0.1.0',
    },
  })

  const data = await res.json()
  if (!data.data?.children) return []

  return data.data.children.map(c => ({
    title: c.data.title,
    url: `https://reddit.com${c.data.permalink}`,
    score: c.data.score,
    comments: c.data.num_comments,
    author: c.data.author,
    subreddit: c.data.subreddit,
    date: new Date(c.data.created_utc * 1000).toISOString().split('T')[0],
    summary: c.data.selftext?.substring(0, 200) || null,
  }))
}
