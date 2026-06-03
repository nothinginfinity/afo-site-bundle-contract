# sample-restaurant-v004-afo

Preview-only Worker app mirror for Restaurant v0.04, a menu content-engine demo.

v0.04 turns a registry into:

- `/menu` rich HTML tabs
- `/menu.md` LLM-friendly markdown
- `/menu/{section}/{slug}` clean item pages
- `/menu/{section}/{slug}.md` markdown item pages
- `/items/{id}` item pages
- `/items/{id}?format=md` item markdown
- `/registry.json` source-of-truth registry
- per-item MenuItem schema
- aggregate MenuSection/Menu schema
- behind-the-dish article routes
- generated sitemap entries

Guardrails:

- workers.dev preview only
- No production routes
- No custom domains
- No account IDs
- No secrets
- `deployment.confirmed` must remain false
