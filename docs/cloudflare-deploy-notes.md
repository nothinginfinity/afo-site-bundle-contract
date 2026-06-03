# Cloudflare Deploy Notes

This document covers Cloudflare-specific considerations for AFO Site Bundle deployments.

> **Reminder:** Cloudflare is the deployment and runtime target only. GitHub is the source of truth.

---

## Deploy Flow (via AFO Mobile Terminal)

1. AFO Mobile Terminal reads Worker source from GitHub
2. Calls AFO Mobile Deploy MCP via Cloudflare service binding
3. Deploy MCP runs `wrangler deploy` (or equivalent API call) against the Worker source
4. Result is written back to the bundle's `deployment` section in GitHub

**Never run `wrangler deploy` manually.** Always go through AFO Mobile Terminal to maintain the GitHub audit trail.

---

## Worker Naming

- Worker names must be globally unique within your Cloudflare account
- Use the pattern: `{client-slug}-site` (e.g., `capistrano-plumbing-site`)
- Worker name in `wrangler.toml` must match `worker.name` in the bundle

---

## Custom Domains

- Set `worker.custom_domain` in the bundle
- Custom domains are provisioned via Cloudflare dashboard or API
- The deploy MCP handles route binding if `worker.routes` is set

---

## Bindings

- KV and D1 bindings are defined in `worker.kv_bindings` and `worker.d1_bindings`
- Bindings must be created in the Cloudflare dashboard before deploy
- IDs are stored in the bundle for reference (never secrets — only IDs)

---

## Secrets / Environment Variables

- **Do not commit secrets to GitHub**
- Non-secret env vars go in `worker.env_vars` in the bundle
- Secrets are set via `wrangler secret put` or the Cloudflare dashboard
- Document which secrets are required in `worker.env_vars` using placeholder values like `"STRIPE_KEY": "<set via wrangler secret>"`

---

## compatibility_date

- Always set `compatibility_date` in `wrangler.toml` and `worker.compatibility_date` in the bundle
- Use a date at least 30 days in the past to avoid unexpected behavior from new compatibility flags
- Recommended: `2025-01-01` as a stable baseline

---

## After Deploy

1. Smoke tests run automatically via Mobile Terminal
2. Receipt is written to GitHub
3. Worker is registered in Toolsmith / Control Center
4. `status` in the bundle is updated to `deployed`
