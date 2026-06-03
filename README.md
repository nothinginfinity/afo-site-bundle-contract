# AFO Site Bundle Manifest v1

Schema: `afo.site.bundle`
Version: `1.0.0`
Canonical file: `afo.site.bundle.json`

This repo defines the shared contract between website generation and deployment across the AFO ecosystem.

GitHub is the source of truth. Cloudflare is only the runtime target.

Production deployment requires `deployment.confirmed = true`.

## Participants

| System | Role |
|---|---|
| AFO Micro SEO Site Builder MCP | Generates the bundle, content, discovery files, schema, and Worker source. |
| AFO Mobile Terminal MCP | Validates, previews, smoke-tests, registers, and writes receipts. |
| AFO Mobile Deploy MCP | Executes Cloudflare Worker deployment after confirmation. |
| GitHub | Source of truth for contract, source files, generated bundles, and receipts. |
| Cloudflare Workers | Runtime target that serves the site. |

## Workflow

1. AFO Micro SEO Builder generates `afo.site.bundle.json` and Worker files.
2. The bundle and Worker files are committed to GitHub.
3. AFO Mobile Terminal validates the bundle and Worker.
4. AFO Mobile Terminal creates a preview deployment.
5. Production deployment requires `deployment.confirmed = true`.
6. After deployment, smoke tests run.
7. Receipts are written back to GitHub under `/receipts/`.

## Required Manifest Sections

- `schema`
- `schema_version`
- `bundle_id`
- `bundle_type`
- `status`
- `created_at`
- `updated_at`
- `build_intent`
- `client`
- `site`
- `content`
- `discovery`
- `schema_jsonld`
- `worker`
- `repo`
- `validation`
- `deployment`
- `smoke_tests`
- `registry`
- `handoff`

## Lifecycle States

`draft -> generated -> validated -> preview_ready -> preview_deployed -> smoke_tested -> production_ready -> production_deployed -> registered -> receipted`

`failed` may be used for any failed validation, deployment, smoke-test, registry, or receipt step.

## Safety Rule

```json
{
  "deployment": {
    "deploy_mode": "preview_first",
    "confirmed": false,
    "environment": "preview"
  }
}
```

`deployment.confirmed` must be explicitly set to `true` before production deployment.
