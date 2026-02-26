#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { searchReddit } from './sources/reddit.js'
import { searchYouTube } from './sources/youtube.js'
import { searchHackerNews } from './sources/hackernews.js'
import { searchGitHubTrending } from './sources/github-trending.js'
import { searchProductHunt } from './sources/producthunt.js'
import { searchArXiv } from './sources/arxiv.js'
import { searchDevTo } from './sources/devto.js'
import 'dotenv/config'

const server = new McpServer({
  name: 'research-mcp',
  version: '0.1.0',
})

// ─── Tool: research (multi-source) ───────────────────────

server.tool(
  'research',
  'Pesquisa multi-fonte sobre um topico. Busca em Reddit, YouTube, HN, GitHub Trending, Product Hunt, ArXiv e Dev.to. Retorna resultados rankeados por relevancia.',
  {
    query: z.string().describe('Topico ou pergunta para pesquisar'),
    sources: z.array(z.enum(['reddit', 'youtube', 'hackernews', 'github', 'producthunt', 'arxiv', 'devto']))
      .optional()
      .describe('Fontes especificas (default: todas disponiveis)'),
    subreddits: z.array(z.string()).optional()
      .describe('Subreddits especificos para buscar (default: AI/tech subs)'),
    timeframe: z.enum(['day', 'week', 'month', 'year']).optional()
      .describe('Periodo de tempo (default: week)'),
    limit: z.number().optional()
      .describe('Numero maximo de resultados por fonte (default: 10)'),
  },
  async ({ query, sources, subreddits, timeframe, limit }) => {
    const activeSources = sources || getAvailableSources()
    const tf = timeframe || 'week'
    const max = limit || 10

    const results = []
    const errors = []

    const tasks = activeSources.map(async (source) => {
      try {
        switch (source) {
          case 'reddit':
            return { source, items: await searchReddit(query, { subreddits, timeframe: tf, limit: max }) }
          case 'youtube':
            return { source, items: await searchYouTube(query, { limit: max }) }
          case 'hackernews':
            return { source, items: await searchHackerNews(query, { limit: max }) }
          case 'github':
            return { source, items: await searchGitHubTrending(query, { limit: max }) }
          case 'producthunt':
            return { source, items: await searchProductHunt(query, { limit: max }) }
          case 'arxiv':
            return { source, items: await searchArXiv(query, { limit: max }) }
          case 'devto':
            return { source, items: await searchDevTo(query, { limit: max }) }
        }
      } catch (err) {
        errors.push({ source, error: err.message })
        return { source, items: [] }
      }
    })

    const settled = await Promise.all(tasks)
    for (const r of settled) {
      if (r && r.items.length > 0) results.push(r)
    }

    const output = formatResults(query, results, errors)
    return { content: [{ type: 'text', text: output }] }
  }
)

// ─── Tool: reddit_search (focused) ──────────────────────

server.tool(
  'reddit_search',
  'Busca focada no Reddit. Pesquisa em subreddits especificos ou nos defaults de AI/tech.',
  {
    query: z.string().describe('Termo de busca'),
    subreddits: z.array(z.string()).optional()
      .describe('Subreddits (default: artificial, MachineLearning, LocalLLaMA, SideProject)'),
    sort: z.enum(['relevance', 'hot', 'top', 'new']).optional()
      .describe('Ordenacao (default: relevance)'),
    timeframe: z.enum(['day', 'week', 'month', 'year']).optional(),
    limit: z.number().optional(),
  },
  async ({ query, subreddits, sort, timeframe, limit }) => {
    try {
      const items = await searchReddit(query, { subreddits, sort, timeframe, limit })
      const text = formatSourceResults('Reddit', items)
      return { content: [{ type: 'text', text }] }
    } catch (err) {
      return { content: [{ type: 'text', text: `Erro ao buscar Reddit: ${err.message}` }] }
    }
  }
)

// ─── Tool: youtube_search (focused) ─────────────────────

server.tool(
  'youtube_search',
  'Busca videos no YouTube por query. Retorna titulo, canal, views, link e descricao.',
  {
    query: z.string().describe('Termo de busca'),
    limit: z.number().optional(),
  },
  async ({ query, limit }) => {
    try {
      const items = await searchYouTube(query, { limit })
      const text = formatSourceResults('YouTube', items)
      return { content: [{ type: 'text', text }] }
    } catch (err) {
      return { content: [{ type: 'text', text: `Erro ao buscar YouTube: ${err.message}` }] }
    }
  }
)

// ─── Tool: hackernews_search (focused) ──────────────────

server.tool(
  'hackernews_search',
  'Busca no Hacker News (Algolia API). Retorna posts e discussoes relevantes.',
  {
    query: z.string().describe('Termo de busca'),
    limit: z.number().optional(),
  },
  async ({ query, limit }) => {
    try {
      const items = await searchHackerNews(query, { limit })
      const text = formatSourceResults('Hacker News', items)
      return { content: [{ type: 'text', text }] }
    } catch (err) {
      return { content: [{ type: 'text', text: `Erro ao buscar HN: ${err.message}` }] }
    }
  }
)

// ─── Tool: github_trending ──────────────────────────────

server.tool(
  'github_trending',
  'Busca repositorios trending no GitHub por linguagem ou topico.',
  {
    query: z.string().describe('Topico ou linguagem'),
    limit: z.number().optional(),
  },
  async ({ query, limit }) => {
    try {
      const items = await searchGitHubTrending(query, { limit })
      const text = formatSourceResults('GitHub Trending', items)
      return { content: [{ type: 'text', text }] }
    } catch (err) {
      return { content: [{ type: 'text', text: `Erro ao buscar GitHub: ${err.message}` }] }
    }
  }
)

// ─── Tool: arxiv_search ─────────────────────────────────

server.tool(
  'arxiv_search',
  'Busca papers academicos no ArXiv. Ideal para pesquisa de ponta em AI/ML.',
  {
    query: z.string().describe('Termo de busca'),
    limit: z.number().optional(),
  },
  async ({ query, limit }) => {
    try {
      const items = await searchArXiv(query, { limit })
      const text = formatSourceResults('ArXiv', items)
      return { content: [{ type: 'text', text }] }
    } catch (err) {
      return { content: [{ type: 'text', text: `Erro ao buscar ArXiv: ${err.message}` }] }
    }
  }
)

// ─── Helpers ─────────────────────────────────────────────

function getAvailableSources() {
  const sources = ['hackernews', 'github', 'arxiv', 'devto']
  if (process.env.REDDIT_CLIENT_ID) sources.unshift('reddit')
  if (process.env.YOUTUBE_API_KEY) sources.push('youtube')
  if (process.env.PRODUCTHUNT_TOKEN) sources.push('producthunt')
  return sources
}

function formatResults(query, results, errors) {
  let out = `# Research: "${query}"\n\n`
  out += `Fontes consultadas: ${results.map(r => r.source).join(', ')}\n`
  if (errors.length) out += `Fontes com erro: ${errors.map(e => `${e.source} (${e.error})`).join(', ')}\n`
  out += `\n---\n\n`

  for (const r of results) {
    out += formatSourceResults(r.source, r.items) + '\n\n'
  }

  return out
}

function formatSourceResults(source, items) {
  if (!items || items.length === 0) return `## ${source}\nNenhum resultado encontrado.\n`

  let out = `## ${source} (${items.length} resultados)\n\n`
  for (const item of items) {
    out += `### ${item.title}\n`
    if (item.url) out += `Link: ${item.url}\n`
    if (item.score) out += `Score: ${item.score}`
    if (item.comments) out += ` | Comentarios: ${item.comments}`
    if (item.author) out += ` | Autor: ${item.author}`
    if (item.score || item.comments || item.author) out += '\n'
    if (item.date) out += `Data: ${item.date}\n`
    if (item.summary) out += `${item.summary}\n`
    out += '\n'
  }
  return out
}

// ─── Start ───────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)
