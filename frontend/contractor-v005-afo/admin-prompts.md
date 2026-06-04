# Contractor v0.05 Admin Prompt Templates

These are reusable prompt-generator modes exposed by `/admin/prompts.json` and the `/admin` UI.

- `update_images` — update imagery, alt text, and asset slots.
- `rewrite_articles` — rewrite or add contractor articles.
- `create_featured_project` — create or update featured project page data and UI.
- `improve_sticky_cta` — improve mobile sticky CTA and footer CTA.
- `update_services` — update service cards and `/services.json`.
- `improve_hero_copy` — improve homepage hero copy and CTA hierarchy.
- `add_customer_faqs` — add FAQ and knowledge-base content.
- `seed_backend_knowledge` — generate backend seed handoff only; no D1 writes from v0.05 admin.
- `register_media_asset` — generate media registration metadata only; no R2 writes from v0.05 admin.
- `create_customer_demo_version` — create a next-version handoff for an isolated preview Worker.

## Standard safety block

- Keep preview-only.
- Do not create production routes.
- Do not add custom domains.
- Do not add account IDs.
- Do not add secrets or real auth secrets.
- Do not modify or redeploy contractor-v001-afo, contractor-v002-afo, contractor-v003-afo, or contractor-v004-afo unless Jared explicitly asks.
- Preserve `BACKEND -> afo-demo-backend-v001`.
- Write/update `receipts/contractor-v005-afo.deploy.json`.
- Report commit SHA and deployment ID.
