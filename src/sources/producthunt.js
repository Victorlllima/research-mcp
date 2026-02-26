import fetch from 'node-fetch'

export async function searchProductHunt(query, opts = {}) {
  const token = process.env.PRODUCTHUNT_TOKEN
  if (!token) throw new Error('PRODUCTHUNT_TOKEN nao configurado')

  const limit = opts.limit || 10

  const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        posts(order: VOTES, topic: "${query}", first: ${limit}) {
          edges {
            node {
              name
              tagline
              url
              votesCount
              website
              createdAt
              makers { name }
            }
          }
        }
      }`,
    }),
  })

  const data = await res.json()
  const posts = data?.data?.posts?.edges || []

  return posts.map(({ node }) => ({
    title: `${node.name} - ${node.tagline}`,
    url: node.url,
    score: node.votesCount,
    author: node.makers?.[0]?.name || null,
    date: node.createdAt?.split('T')[0],
    summary: node.tagline,
  }))
}
