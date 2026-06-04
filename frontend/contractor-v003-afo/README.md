# AFO Contractor Demo v0.03 — CCS Services Group

Worker: `contractor-v003-afo`  
URL: https://contractor-v003-afo.jaredtechfit.workers.dev/  
Version: `0.03`  
Binding: `BACKEND -> afo-demo-backend-v001`

## What's new in v0.03

### Visual & rendering
- **Animated full-bleed hero** with Unsplash construction/kitchen images, slow zoom animation on load
- **Hero stats bar** — 15+ years, 500+ projects, 5-star rating, 100% licensed & insured
- **Tabbed service panels** — click any service tab to see a photo, full description, checklist, and estimate CTA. Smooth fade-in between tabs.
- **Project portfolio grid** — 6 sample LA projects with photo cards (hover zoom), overlay type badge
- **Image lightbox** — click any project card for full details: photo, description, sq ft, budget range, and estimate CTA
- **Project filter bar** — filter by service type (All / Kitchen / Bathroom / ADU / New Construction / General / Exterior)

### Content & SEO
- **5 expanded articles** with click-to-expand body text:
  - Navigating LA permitting for ADUs in 2026
  - Which kitchen upgrades deliver ROI in the LA market
  - Why your contractor's CSLB license matters more than you think
  - 2026 bathroom remodel trends worth the investment in LA
  - The right order to tackle a home remodel
- **Open Graph + Twitter Card meta tags** — og:title, og:description, og:image, og:url, twitter:card, twitter:image
- Full-page `clamp()` fluid typography — scales cleanly from 320px to 1440px+
- `/projects.json` endpoint for future portfolio CMS integration

### Navigation & interaction
- **Full nav**: Home / Services / Projects / Process / Reviews / Resources / Phone / Free estimate CTA
- **Hamburger mobile menu** with animated open/close and slide-in drawer
- **Article expand/collapse** — each article has a Read more toggle, no page navigation needed

### Leads form
- Budget range dropdown: Under $25K / $25K–$50K / $50K–$100K / $100K–$250K / $250K+
- Timeline dropdown: ASAP / 1–3 months / 3–6 months / 6+ months
- Labeled fields with uppercase micro-labels
- Budget and timeline included in lead payload to backend

## Routes

| Route | Description |
|---|---|
| `/` | Full HTML |
| `/health` | Worker + backend health |
| `/services.json` | 6 CCS services with highlights |
| `/projects.json` | 6 sample LA portfolio projects |
| `/knowledge.json` | 12 knowledge chunks |
| `/articles.json` | 5 expanded LA contractor articles |
| `/chat` | Knowledge-grounded chat |
| `/leads` | Lead capture — budget + timeline fields |
| `/media/:key` | R2 proxy |
| `/schema.json` | Contract metadata |
| `/llms.txt` | LLM contract |
| `/robots.txt` | Robots exclusion |
| `/sitemap.xml` | Sitemap |

## Security
- No production routes, no custom domains
- No account IDs or secrets exposed
- `deployment.confirmed` not changed
- Preview-only Workers.dev deploy
