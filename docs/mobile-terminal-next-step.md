# AFO Mobile Terminal Next Step

This repo is the GitHub source of truth for AFO Site Bundle Manifest v1. Cloudflare is only the preview/runtime target. AFO Mobile Terminal should treat every step as validation-first and preview-first unless a later operator-confirmed manifest explicitly changes `deployment.confirmed` to `true`.

## Consumption flow

1. Read `examples/example-business/afo.site.bundle.json` from GitHub.
2. Read `schema/afo.site.bundle.schema.json` from GitHub.
3. Validate the bundle against the schema before touching the Worker folder.
4. Confirm the manifest remains preview-safe:
   - `schema` is `afo.site.bundle`
   - `schema_version` is `1.0.0`
   - `deployment.deploy_mode` is `preview_first`
   - `deployment.confirmed` is `false`
   - `deployment.environment` is `preview`
5. Validate the Worker folder exists at the manifest `repo.worker_path`.
6. Verify the Worker source serves:
   - `/`
   - `/health`
   - `/llms.txt`
   - `/robots.txt`
   - `/sitemap.xml`
   - `/schema.json`
7. Run local validation from the repo root:

```bash
npm install
npm run validate
npm run check
```

8. Run preview only from the Worker folder:

```bash
cd examples/example-business/worker
npm install
npm run preview
```

9. Smoke test the preview URL only:
   - `/` should return HTML.
   - `/health` should return JSON with `ok: true`.
   - `/llms.txt` should return `text/plain`.
   - `/robots.txt` should return `text/plain`.
   - `/sitemap.xml` should return `application/xml`.
   - `/schema.json` should return `application/json`.
10. Write validation, preview, and smoke-test receipts back to GitHub under `receipts/`.

## Safety gates

AFO Mobile Terminal must not production deploy unless all of the following are true:

- The manifest has `deployment.confirmed: true`.
- The operator explicitly requested production deployment in the current task.
- The target runtime configuration has no unexpected production routes or custom domains.
- A receipt is written back to GitHub after the action.

For the current example bundle, `deployment.confirmed` is intentionally `false`, so only preview validation and preview smoke testing are allowed.

## Wrangler expectations

`examples/example-business/worker/wrangler.toml` should remain preview-safe:

- no production routes
- no account-scoped identifiers
- no custom domains
- no environment variable blocks
- `compatibility_date = "2026-06-01"`

## Receipt expectations

Receipts written to GitHub should include:

- source commit SHA
- manifest path
- schema validation result
- Worker type-check result
- preview command used
- preview URL, when available
- smoke-test route results
- timestamp
- acting system name

GitHub remains the audit trail. Runtime state alone is not sufficient evidence.
