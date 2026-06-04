# AFO Sample Restaurant Frontend v0.10

Worker: `sample-restaurant-v010-afo`
URL: https://sample-restaurant-v010-afo.jaredtechfit.workers.dev/
Version: `0.10`
Bindings: `BACKEND -> afo-demo-backend-v001` (Cloudflare service binding)

## What's new in v0.10

Fully backend-driven rendering. The frontend loads `/site.json`, `/menu.json`, `/articles.json`, and `/media.json` from the backend on every request and renders sections defined in `/site.json`.

## Routes

| Route | Description |
|---|---|
| `/` | Full HTML page, backend-driven |
| `/health` | Frontend health + backend status check |
| `/site.json` | Passthrough to backend `/site.json` |
| `/menu.json` | Passthrough to backend `/menu.json` |
| `/articles.json` | Passthrough to backend `/articles.json` |
| `/media.json` | Passthrough to backend `/media.json` |
| `/knowledge.json` | Passthrough to backend `/knowledge.json` |
| `/chat` | POST proxy to backend `/chat` via service binding |
| `/leads` | POST proxy to backend `/leads` via service binding |
| `/media/:key` | Media proxy via service binding |
| `/schema.json` | Frontend + backend contract metadata |
| `/llms.txt` | LLM-readable contract description |
| `/robots.txt` | Robots exclusion |
| `/sitemap.xml` | Sitemap |

## Design

- Hero image sourced from backend media refs (not hardcoded URL)
- Chat UI shows answer, citations (source titles), and suggested actions (scrolls to lead form or menu)
- Lead form posts to `/leads` proxy
- Fallback banner: "Backend temporarily unavailable — using cached data" with Retry button
- "Backend connected" badge when all backend checks pass
- Sections rendered from `/site.json` section array

## Security

- No production routes
- No custom domains
- No account IDs or secrets exposed
- `deployment.confirmed` not changed
