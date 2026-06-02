# AFO Site Bundle Manifest v1

**Schema:** `afo.site.bundle` · **Version:** `1.0.0` · **Filename:** `afo.site.bundle.json`

This repo defines the shared contract between website generation and deployment across the AFO ecosystem.

> **GitHub is the source of truth. Cloudflare is the runtime/deployment target only.**

---

## What Is a Site Bundle?

An AFO Site Bundle is a portable, self-describing package that contains everything needed to deploy a business website as a Cloudflare Worker:

- The manifest (`afo.site.bundle.json`) describing the site, client, content, and deployment intent
- Worker source files (`worker/src/index.ts`, `wrangler.toml`, `package.json`)
- Static content files (`public/llms.txt`, `robots.txt`, `sitemap.xml`)
- Structured content (`content/pages.json`, `articles.json`, `faqs.json`, `schema.json`)

---

## Participants

| Agent | Role |
|---|---|
| **AFO Micro SEO Site Builder MCP** | Generates the bundle — manifest, content, schema, Worker files |
| **AFO Mobile Terminal MCP** | Validates the bundle, orchestrates deploy, runs smoke tests |
| **AFO Mobile Deploy MCP** | Executes the actual Cloudflare Worker deploy |
| **GitHub** | Source of truth — all files live here |
| **Cloudflare Workers** | Runtime target — receives the deploy, serves the site |

---

## Workflow

```
1. AFO Micro SEO Builder generates afo.site.bundle.json and all Worker files.
2. The bundle and Worker files are committed to GitHub.
3. AFO Mobile Terminal reads the bundle from GitHub and validates it.
4. AFO Mobile Terminal creates a preview deploy (Cloudflare Workers preview URL).
5. Nothing deploys to production unless deployment.confirmed = true.
6. After deploy, smoke tests run against the live URL.
7. Receipts are written back to GitHub under receipts/.
```

---

## Manifest Top-Level Fields

| Field | Owner | Description |
|---|---|---|
| `schema` | Builder | Schema identity: `afo.site.bundle` |
| `schema_version` | Builder | Semver: `1.0.0` |
| `bundle_id` | Builder | Unique UUID for this bundle |
| `bundle_type` | Builder | e.g., `business_site` |
| `status` | Terminal | Current lifecycle state |
| `created_at` | Builder | ISO 8601 timestamp |
| `updated_at` | Terminal | ISO 8601 timestamp |
| `build_intent` | Builder | Human-readable description of what was built |
| `client` | Builder | Business name, industry, contact info |
| `site` | Builder | Domain, base URL, title, description |
| `content` | Builder | Pages, articles, FAQs |
| `discovery` | Builder | SEO metadata, sitemap, robots |
| `schema_jsonld` | Builder | JSON-LD structured data |
| `worker` | Terminal | Cloudflare Worker name, entry point |
| `repo` | Terminal | GitHub owner, repo, branch, path |
| `validation` | Terminal | Validation results |
| `deployment` | Terminal | Deploy mode, confirmed flag, URLs |
| `smoke_tests` | Both | Routes (Builder), last_smoke_test (Terminal) |
| `registry` | Terminal | Toolsmith/AFO registry status |
| `handoff` | Terminal | Handoff metadata for next agent |

---

## Key Safety Rule

```json
"deployment": {
  "confirmed": false
}
```

**`deployment.confirmed` defaults to `false`. Nothing reaches production until it is explicitly set to `true`.**

---

## Repo Layout

```
afo-site-bundle-contract/
├── README.md
├── schema/
│   └── afo.site.bundle.schema.json
├── examples/
│   └── example-business/
│       ├── afo.site.bundle.json
│       ├── worker/
│       │   ├── wrangler.toml
│       │   ├── package.json
│       │   ├── src/index.ts
│       │   └── public/
│       │       ├── llms.txt
│       │       ├── robots.txt
│       │       └── sitemap.xml
│       └── content/
│           ├── pages.json
│           ├── articles.json
│           ├── faqs.json
│           └── schema.json
├── docs/
│   ├── lifecycle.md
│   ├── mcp-handoff.md
│   ├── repo-layout.md
│   └── cloudflare-deploy-notes.md
└── receipts/
    └── .gitkeep
```

---

## Extending This Contract

This is v1 — intentionally minimal and readable. Future versions may add:

- Multi-page content models
- Image asset manifests
- A/B test variants
- Multi-environment deployment targets
- KV/D1 binding declarations

To extend: bump `schema_version`, update `schema/afo.site.bundle.schema.json`, add migration notes in `docs/`.
