# AFO Demo Backend v0.02

Worker: `afo-demo-backend-v001` (updated in-place)
Version string: `0.02`

## New routes in v0.02

| Route | Method | Description |
|---|---|---|
| `/site.json` | GET | Full site render contract (sections, theme, SEO, media refs, source refs) |
| `/knowledge.json` | GET | Active knowledge chunks for AI chat grounding |
| `/admin/knowledge/seed` | POST | Seed/update knowledge_chunks in D1 (preview-scoped, rate-limited) |
| `/admin/media/register` | POST | Register confirmed media assets in D1 |

## Upgraded routes

- `POST /chat` — now retrieves from D1 knowledge_chunks, returns citations + suggested_actions

## Preserved routes

- `GET /health`
- `GET /menu.json`
- `GET /articles.json`
- `GET /media.json`
- `GET /media/IMG_1530.jpeg`
- `POST /leads`
- `POST /admin/schema`
- `POST /admin/seed`
- `GET /mcp/actions/update-seasonal-menu`

## Bindings

- D1: `DB` → `ccbd076e-aaa7-42bb-8808-a20bd83569e2`
- R2: `MEDIA` → `afo-site-content`

## Security

- No production routes
- No custom domains
- No account IDs exposed
- No secrets exposed
- `deployment.confirmed` not changed
- Mutating admin routes are preview-scoped and rate-limited
