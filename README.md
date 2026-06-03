# AFO Site Bundle Contract

**Version:** 1.0  
**Status:** Active  
**Maintainer:** AFO / Jared

---

## What Is This?

This repo defines the **AFO Site Bundle Manifest v1** — the shared contract used between:

- **AFO Micro SEO Site Builder MCP** — generates the bundle and commits Worker files to GitHub
- **AFO Mobile Terminal MCP** — validates, previews, deploys, smoke-tests, and writes receipts
- **AFO Mobile Deploy MCP** — executes the actual Cloudflare deployment

> **GitHub is the source of truth. Cloudflare is only the deployment and runtime target.**
>
> Nothing is deployed to production unless `deployment.confirmed = true`.

---

## Architecture

```
iPhone
→ AFO Mobile Terminal MCP
→ Cloudflare service binding
→ AFO Mobile Deploy MCP
→ GitHub source-of-truth
→ Cloudflare Workers runtime
→ smoke tests
→ GitHub deployment receipts
```

---

## Workflow

1. **AFO Micro SEO Builder** generates `afo.site.bundle.json`.
2. The bundle and Worker files are committed to GitHub.
3. **AFO Mobile Terminal** validates the Worker.
4. **AFO Mobile Terminal** previews the deploy.
5. **Nothing deploys to production** unless `deployment.confirmed = true`.
6. After deploy, smoke tests run automatically.
7. Receipts are written back to GitHub in `/receipts/`.

---

## Repo Layout

```
afo-site-bundle-contract/
├── README.md                          # This file
├── schema/
│   └── afo.site.bundle.schema.json    # JSON Schema for the manifest
├── examples/
│   └── example-business/
│       ├── afo.site.bundle.json        # Example manifest
│       └── worker/
│           ├── wrangler.toml
│           ├── package.json
│           ├── src/index.ts
│           └── public/
│               ├── llms.txt
│               ├── robots.txt
│               └── sitemap.xml
├── docs/
│   ├── lifecycle.md                   # Full bundle lifecycle
│   ├── mcp-handoff.md                 # How MCPs hand off the bundle
│   ├── repo-layout.md                 # Expected GitHub repo structure
│   └── cloudflare-deploy-notes.md     # Cloudflare-specific deploy notes
└── receipts/
    └── .gitkeep                       # Deployment receipts written here
```

---

## Manifest Top-Level Sections

| Section | Purpose |
|---|---|
| `schema` | Schema identifier and version |
| `schema_version` | Semver string |
| `bundle_id` | Unique bundle UUID |
| `bundle_type` | e.g. `micro_seo_site` |
| `status` | `draft` \| `ready` \| `deployed` \| `failed` |
| `created_at` | ISO 8601 timestamp |
| `updated_at` | ISO 8601 timestamp |
| `build_intent` | Human-readable description of what this site does |
| `client` | Business/client info |
| `site` | Domain, title, description |
| `content` | Pages, copy blocks |
| `discovery` | SEO, meta, keywords |
| `schema_jsonld` | JSON-LD structured data |
| `worker` | Cloudflare Worker config |
| `repo` | GitHub repo details |
| `validation` | Pre-deploy validation results |
| `deployment` | Deploy config — `confirmed` defaults to `false` |
| `smoke_tests` | Post-deploy test definitions |
| `registry` | Toolsmith / control center registration |
| `handoff` | MCP handoff metadata |

---

## Key Rule

```json
"deployment": {
  "confirmed": false
}
```

**`confirmed` must be explicitly set to `true` by the operator (via AFO Mobile Terminal) before any production deploy runs.** The deploy MCP will refuse to deploy if this field is `false` or missing.

---

## Contributing / Extending

This contract is designed to be extended by other LLMs and MCPs. Keep additions backward-compatible:

- Add new top-level sections rather than modifying existing ones
- Increment `schema_version` on any breaking change
- Update `schema/afo.site.bundle.schema.json` to match
- Add an example in `examples/` for any new bundle type
