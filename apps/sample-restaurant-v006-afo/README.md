# Sample Restaurant v0.06 AFO

Preview-only Cloudflare Worker bundle for Restaurant v0.06.

Live preview:

https://sample-restaurant-v006-afo.jaredtechfit.workers.dev/

## Purpose

Restaurant v0.06 upgrades the sample restaurant demo into an HTML-first, conversion-ready, MCP-action-ready restaurant preview.

## Key features

- HTML-first `/menu`
- Tailwind-style cards, tabs, badges, spacing, and typography
- Optimized WebP image URLs
- Image `alt`, `loading`, `decoding`, and `sizes` attributes
- Today’s specials banner
- In-season badges from registry JSON
- `/menu.json`
- `/registry.json`
- Deeper Restaurant/Menu/MenuSection/MenuItem/Offer/Review/Article schema
- MCP dry-run action routes
- Expanded article array
- Article tie-ins
- A/B dark preview at `/menu?variant=dark`
- Sticky conversion CTA preserved: `Menu/Reserve/Event`

## Safety

This bundle is preview-only.

No production routes.
No custom domains.
No account IDs.
No secrets.
No bindings.
Do not set deployment.confirmed to true.

## Routes

- `/`
- `/menu`
- `/menu?variant=dark`
- `/menu.json`
- `/menu.md`
- `/registry.json`
- `/items/101`
- `/items/101?format=md`
- `/menu/starters/seared-scallops`
- `/menu/starters/seared-scallops.md`
- `/articles/behind-the-seared-scallops`
- `/articles/{slug}`
- `/articles/{slug}.md`
- `/mcp/actions`
- `/mcp/actions/update-seasonal-menu`
- `/health`
- `/llms.txt`
- `/robots.txt`
- `/sitemap.xml`
- `/schema.json`
