# AFO Contractor Demo v0.01

Worker: `contractor-v001-afo`
URL: https://contractor-v001-afo.jaredtechfit.workers.dev/
Version: `0.01`
Vertical: Residential & Commercial General Contractor
Binding: `BACKEND -> afo-demo-backend-v001` (Cloudflare service binding)

## Business

**Ridgeline Construction** — Licensed, bonded, and insured general contractor. Residential and commercial.

## Sections (backend-driven via /site.json, fallback-safe)

| Section | Type | Description |
|---|---|---|
| Hero | `hero` | Full-bleed image, headline, licensed/bonded/insured badge, dual CTAs |
| Services | `services` | 6-card grid with icon, description, timeline, price range, estimate CTA |
| Process | `process` | 6-step build process (estimate → contract → permits → build → punch list → sign-off) |
| Articles | `articles` | Blog cards from `/articles.json` |
| Chat | `chat` | Knowledge-grounded AI assistant with citations and suggested actions |
| Leads | `leads` | Split-layout estimate request form with trust signals |

## Services catalog (`/services.json`)

- Kitchen Remodels — $35K–$120K, 4–8 weeks
- Room Additions / ADU — $80K–$350K, 3–6 months
- New Home Construction — from $450K, 10–18 months
- Commercial Tenant Improvements — $50K–$500K+, 6–16 weeks
- Bathroom Remodels — $15K–$60K, 2–5 weeks
- Roofing & Exterior — $12K–$80K, 1–2 weeks

## Knowledge chunks (`/knowledge.json`)

12 chunks covering: services overview, estimate process, licensing, permits, kitchen remodels, ADU/additions, commercial TI, timelines, payment/draw schedule, warranty, contact/service area, AFO demo explanation.

## Theme

- Primary: `#1c2b3a` (dark navy)
- Accent: `#e07b2a` (construction orange)
- Background: `#f7f6f4`
- Fonts: Oswald (headings) + Inter (body)

## Routes

| Route | Description |
|---|---|
| `/` | Full HTML, backend-driven |
| `/health` | Worker health + backend status |
| `/site.json` | Passthrough to backend |
| `/services.json` | Contractor service catalog (local) |
| `/knowledge.json` | Knowledge chunks (local, 12 chunks) |
| `/articles.json` | Passthrough to backend (contractor fallback) |
| `/media.json` | Passthrough to backend |
| `/chat` | Knowledge-grounded chat with citations |
| `/leads` | Lead capture — proxied to backend via service binding |
| `/media/:key` | R2 media proxy via service binding |
| `/schema.json` | Contract metadata |
| `/llms.txt` | LLM-readable contract |
| `/robots.txt` | Robots exclusion |
| `/sitemap.xml` | Sitemap |

## Design decisions

- Chat knowledge is contractor-specific (services, permits, timelines, payment, warranty) — independent of restaurant backend knowledge chunks
- `/site.json` is loaded from the shared backend but falls back gracefully to contractor-specific defaults — sections always render correctly
- Articles fall back to contractor-specific content (permit guide, kitchen trends, ADU basics) if backend returns restaurant content
- Lead form forwards to backend `/leads` via service binding when available

## Security

- No production routes
- No custom domains
- No account IDs or secrets exposed
- `deployment.confirmed` not changed
