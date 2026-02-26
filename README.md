# Research MCP Server

MCP server para pesquisa multi-fonte. Plugue no Claude Code e tenha acesso direto a Reddit, YouTube, Hacker News, GitHub Trending, Product Hunt, ArXiv e Dev.to.

## Tools disponiveis

| Tool | Descricao |
|------|-----------|
| `research` | Busca multi-fonte com query unico |
| `reddit_search` | Busca focada no Reddit por subreddit |
| `youtube_search` | Busca videos no YouTube |
| `hackernews_search` | Busca posts no Hacker News |
| `github_trending` | Repos trending no GitHub |
| `arxiv_search` | Papers academicos no ArXiv |

## Fontes e APIs necessarias

| Fonte | API Key necessaria? | Gratuita? |
|-------|---------------------|-----------|
| Hacker News | Nao | Sim |
| ArXiv | Nao | Sim |
| Dev.to | Nao | Sim |
| GitHub | Opcional (rate limit) | Sim |
| Reddit | Sim (OAuth2 app) | Sim |
| YouTube | Sim (Data API v3) | Sim (quota diaria) |
| Product Hunt | Sim (Developer token) | Sim |

## Setup

```bash
# 1. Instalar
cd research-mcp && npm install

# 2. Configurar .env
cp .env.example .env
# Preencher as API keys

# 3. Registrar no Claude Code (~/.claude.json)
# Ver secao abaixo
```

## Registro no Claude Code

Adicionar em `~/.claude.json` dentro de `mcpServers`:

```json
{
  "research-mcp": {
    "type": "stdio",
    "command": "node",
    "args": ["C:/Users/SEU_USER/caminho/research-mcp/src/index.js"],
    "env": {
      "REDDIT_CLIENT_ID": "seu_id",
      "REDDIT_CLIENT_SECRET": "seu_secret",
      "YOUTUBE_API_KEY": "sua_key"
    }
  }
}
```

## Uso no Claude Code

Depois de registrado, o Claude Code tera acesso automatico as tools:

```
"pesquise no reddit sobre OpenClaw vs CrewAI"
-> chama reddit_search automaticamente

"research AI agents frameworks 2026"
-> chama research (multi-fonte)
```

## Status

Em desenvolvimento | Gerenciado pelo RVM Dashboard
