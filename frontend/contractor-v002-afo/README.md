# AFO Contractor Demo v0.02 — CCS Services Group

Worker: `contractor-v002-afo`
URL: https://contractor-v002-afo.jaredtechfit.workers.dev/
Version: `0.02`
Vertical: Los Angeles Licensed General Contractor
Source: https://www.ccsservicesgroup.com/
Binding: `BACKEND -> afo-demo-backend-v001`

## Business

**CCS Services Group** (Construction Connection Services)
- Phone: **(818) 624-7212**
- Address: Encino, CA 91316
- Service area: Los Angeles and surrounding areas
- CSLB License: **#890991** (Class B General Building Contractor)
- Licensed, bonded, and fully insured
- WhatsApp: wa.me/18186247212
- Instagram: @ccs_constructiongroup

## What changed from v0.01

- Real business: CCS Services Group (not fictional Ridgeline Construction)
- Hero: "Los Angeles Kitchen, Bathroom & ADU Remodeling Experts" (from ccsservicesgroup.com tagline)
- CTA: "Get a free estimate" and "View services" (not restaurant language)
- Real CSLB #890991 in hero eyebrow, trust bar, leads section, and footer
- Real phone (818) 624-7212 in nav, hero, chat fallback, and leads
- Real reviews: Gary R., Bobby S., Silvia K. (verbatim from ccsservicesgroup.com)
- Services: Kitchen, Bathroom, Home Addition/ADU, New Construction, General Remodeling, Exterior/Structural (from site)
- Full service highlights pulled from "Any Job / Any Type / Any Size" lists on ccsservicesgroup.com
- Knowledge chunks: 12 CCS-specific chunks covering all services, licensing, contact, reviews, estimate process
- Articles: LA-specific contractor content (kitchen value, ADU guide, CSLB licensing)
- WhatsApp + Instagram buttons in leads section
- CSLB verify link in chat suggested actions for licensing questions
- Footer links to official ccsservicesgroup.com

## Routes

| Route | Description |
|---|---|
| `/` | Full HTML — CCS-branded |
| `/health` | Worker + backend health |
| `/services.json` | CCS service catalog (6 services) |
| `/knowledge.json` | 12 CCS knowledge chunks |
| `/articles.json` | 3 LA contractor articles |
| `/chat` | Knowledge-grounded chat (intent, citations, actions) |
| `/leads` | Lead capture — service-type dropdown, proxied to backend |
| `/media/:key` | R2 proxy via service binding |
| `/schema.json` | Contract metadata |
| `/llms.txt` | LLM-readable contract |
| `/robots.txt` | Robots exclusion |
| `/sitemap.xml` | Sitemap |

## Security

- No production routes, no custom domains
- No account IDs or secrets exposed
- `deployment.confirmed` not changed
- Preview-only Workers.dev deploy
