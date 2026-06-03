# sample-restaurant-v005-afo

Preview-only Worker app mirror for Restaurant v0.05, a conversion-focused content engine.

v0.05 adds:

- Sticky mobile CTA labeled `Menu/Reserve/Event`
- `/menu.json` structured menu endpoint for agents
- deeper `schema.json` with Restaurant, Menu, MenuSection, MenuItem, Offer, and Review data
- testimonial carousel-style trust section
- lazy WebP images with alt text
- ARIA tab roles and labeled testimonial region
- A/B dark-mode preview at `/menu?variant=dark`
- item/article/markdown routes inherited from v0.04

Guardrails:

- workers.dev preview only
- No production routes
- No custom domains
- No account IDs
- No secrets
- `deployment.confirmed` must remain false
