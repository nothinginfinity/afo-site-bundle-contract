# Contractor v0.05 — Contractor + Admin Chat Demo

Preview Worker: `contractor-v005-afo`

Expected preview URL: https://contractor-v005-afo.jaredtechfit.workers.dev/

Backend binding preserved:

```json
{
  "type": "service",
  "name": "BACKEND",
  "service": "afo-demo-backend-v001"
}
```

## Purpose

Contractor v0.05 keeps the Contractor v0.04 customer-facing routes and adds a preview-safe admin/dashboard concept. Jared can open `/admin`, enter the demo password, describe what a customer wants changed, and generate a clean prompt handoff for ChatGPT, Claude, Alice, or MCP tools.

This is **not** autonomous production write mode. The admin chat and prompt generator do not mutate GitHub, D1, R2, Cloudflare, custom domains, or production routes.

## Preview admin warning

Password: `demo`

Visible warning in UI:

> Preview admin only. Default password demo is not production security.

The unlocked preview state is stored in `localStorage` for convenience.

## Required v0.05 routes

- `/`
- `/admin`
- `/admin/prompts.json`
- `/admin/actions.json`
- `/admin/chat`
- `/admin/export-prompt`
- `/projects/featured`
- `/featured-project.json`
- `/health`
- `/services.json`
- `/projects.json`
- `/knowledge.json`
- `/articles.json`
- `/chat`
- `/leads`
- `/schema.json`
- `/llms.txt`
- `/robots.txt`
- `/sitemap.xml`

## Added features

- Contractor + admin chat demo
- Password-gated `/admin` page
- Admin prompt generator
- `/admin/prompts.json` templates endpoint
- `/admin/actions.json` preview-safe future actions endpoint
- `/admin/chat` POST prompt generator endpoint
- `/admin/export-prompt` markdown/text prompt export
- Featured project page foundation
- `/projects/featured`
- `/featured-project.json`
- Improved mobile sticky Get Estimate / Chat CTA
- Backend service binding preserved
- Local fallback JSON when backend is unavailable

## Safety confirmations

- No production routes created
- No custom domains added
- No account IDs added
- No secrets or real auth secrets added
- No bindings added except `BACKEND -> afo-demo-backend-v001`
- `deployment.confirmed` was not set to true
- No prior Contractor v001-v004 Workers were modified or redeployed
- Admin routes are prompt-generating only and do not mutate GitHub, D1, R2, or Cloudflare

## Deployment

Deployment ID: `a3385dc2b28646d2ba61feca402a22d8`

Receipt: `receipts/contractor-v005-afo.deploy.json`

## Smoke-test note

The Worker script deployed successfully and metadata confirms the service binding. External smoke testing of the expected workers.dev URL returned Cloudflare error code `1042`; no production route or custom domain was added to work around that.
