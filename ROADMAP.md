# Research MCP - Roadmap

RVM Project ID: **19**
Tipo: MCP Server (STDIO) para Claude Code

---

## Fase 1 - Core MCP + Fontes gratuitas (sem API key)
- [x] Estrutura base MCP SDK + STDIO transport
- [x] Implementar hackernews_search (Algolia API)
- [x] Implementar arxiv_search (XML API)
- [x] Implementar devto search (REST API)
- [x] Implementar github_trending (GitHub Search API)
- [x] Tool research (multi-fonte unificada)

## Fase 2 - Fontes autenticadas
- [x] Implementar reddit_search (OAuth2 client_credentials)
- [x] Implementar youtube_search (Data API v3)
- [x] Implementar producthunt_search (GraphQL)
- [x] Criar .env.example com todas as keys

## Fase 3 - Registro no Claude Code
- [ ] npm install no projeto
- [ ] Registrar em ~/.claude.json como MCP server
- [ ] Testar cada tool individualmente

## Fase 4 - Melhorias e novas fontes
- [ ] Adicionar caching em memoria (5min TTL)
- [ ] Rate limiting por fonte
- [ ] Adicionar fonte Twitter/X
- [ ] Scoring de relevancia cross-fonte
- [ ] Integrar como fonte no Reddit/YouTube Digest

---

## Tools

| Tool | Fonte | API Key? |
|------|-------|----------|
| `research` | Multi-fonte | Depende |
| `reddit_search` | Reddit | Sim |
| `youtube_search` | YouTube | Sim |
| `hackernews_search` | Hacker News | Nao |
| `github_trending` | GitHub | Opcional |
| `arxiv_search` | ArXiv | Nao |

**Total: 18 tasks | 4 fases**
