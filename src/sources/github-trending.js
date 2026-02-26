import fetch from 'node-fetch'

export async function searchGitHubTrending(query, opts = {}) {
  const limit = opts.limit || 10
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'research-mcp/0.1.0',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { headers })
  const data = await res.json()

  if (!data.items) return []

  return data.items.map(repo => ({
    title: `${repo.full_name} - ${repo.description || ''}`.substring(0, 120),
    url: repo.html_url,
    score: repo.stargazers_count,
    author: repo.owner?.login,
    date: repo.pushed_at?.split('T')[0],
    summary: `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count} | Lang: ${repo.language || '?'}`,
  }))
}
