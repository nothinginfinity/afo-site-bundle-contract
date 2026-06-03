# AFO Mobile Terminal Command Contract

This document defines the preview-safe command contract for AFO Mobile Terminal consuming AFO Site Bundle Manifest v1 from GitHub.

GitHub is the source of truth. Cloudflare is only a preview/runtime target. This integration layer is validation and dry-run only.

## Inputs

Default source inputs:

```json
{
  "owner": "nothinginfinity",
  "repo": "afo-site-bundle-contract",
  "ref": "main",
  "bundle_path": "examples/example-business/afo.site.bundle.json",
  "schema_path": "schema/afo.site.bundle.schema.json",
  "worker_path": "examples/example-business/worker"
}
```

## Safe commands

### `validate_bundle`

Reads the bundle and schema from GitHub and validates the bundle against the schema.

Required checks:

- `schema` is `afo.site.bundle`
- `schema_version` is `1.0.0`
- `deployment.deploy_mode` is `preview_first`
- `deployment.confirmed` is `false`
- `deployment.environment` is `preview`
- `worker.routes` is an empty array

Allowed effects:

- Read GitHub files.
- Produce validation output.

Blocked effects:

- No runtime publish action.
- No live route creation.
- No protected configuration creation.
- No production confirmation changes.

### `validate_worker`

Reads and validates the Worker folder declared by the bundle.

Required files:

- `package.json`
- `wrangler.toml`
- `src/index.ts`

Required safety checks:

- `package.json` `dev` script is `wrangler dev`
- `package.json` `preview` script is `wrangler dev --remote`
- `package.json` `deploy` script is blocked and exits non-zero
- `wrangler.toml` has no live routing entries
- `wrangler.toml` has no account-scoped identifiers
- `wrangler.toml` has no custom domain entries
- `wrangler.toml` has no environment variable block
- `wrangler.toml` has no protected key entries
- `wrangler.toml` has `compatibility_date = "2026-06-01"`

Required Worker routes:

- `/` returns HTML
- `/health` returns JSON with `ok: true`
- `/llms.txt` returns `text/plain`
- `/robots.txt` returns `text/plain`
- `/sitemap.xml` returns `application/xml`
- `/schema.json` returns `application/json`

Allowed effects:

- Read GitHub files.
- Run local static checks.
- Run local type checks if dependencies are installed.

Blocked effects:

- No runtime publish action.
- No live route mutation.
- No Cloudflare account mutation.

### `preview_plan`

Produces a preview-only execution plan without running it.

Output shape:

```json
{
  "mode": "dry_run_only",
  "allowed_command": "npm run preview",
  "working_directory": "examples/example-business/worker",
  "disallowed_commands": ["npm run deploy", "wrangler deploy"],
  "deployment_confirmed_required_for_production": true,
  "deployment_confirmed_current_value": false
}
```

Allowed effects:

- Read bundle and Worker metadata.
- Emit a plan.

Blocked effects:

- Do not run preview in this command.
- Do not publish runtime changes.

### `smoke_test_plan`

Produces the smoke-test plan for a future preview URL.

Required planned tests:

- `GET /` expects status `200` and `text/html`
- `GET /health` expects status `200`, `application/json`, and `ok: true`
- `GET /llms.txt` expects status `200` and `text/plain`
- `GET /robots.txt` expects status `200` and `text/plain`
- `GET /sitemap.xml` expects status `200` and `application/xml`
- `GET /schema.json` expects status `200` and `application/json`

Allowed effects:

- Emit a route test plan.

Blocked effects:

- Do not run tests against a live production URL.
- Do not infer a production URL from manifest data.

### `write_validation_receipt`

Writes a validation dry-run receipt to GitHub after the dry-run checks pass.

Default output path:

```text
receipts/example-business.validation.dry-run.json
```

Allowed effects:

- Create or update a receipt JSON file in GitHub.

Blocked effects:

- Do not write production receipts.
- Do not mark production deployed.
- Do not set `deployment.confirmed` to `true`.

## Commands blocked in this layer

These commands are declared for future compatibility but must return blocked status in this integration layer.

### `deploy_worker`

Blocked now. Future unlock requires an operator-confirmed production workflow, explicit current-task approval, reviewed target routing, and receipt evidence.

### `register_worker`

Blocked now. Future unlock requires passing preview smoke tests, an explicit registry destination, and operator approval.

### `write_production_receipt`

Blocked now. Future unlock requires an explicitly authorized production workflow, successful runtime publish evidence, passing production smoke tests, and recorded route evidence.

## Reference dry-run script

The repository includes:

```bash
node scripts/mobile-terminal-dry-run.mjs
```

To write the dry-run receipt locally before committing it:

```bash
node scripts/mobile-terminal-dry-run.mjs --write-receipt
```

The script reads GitHub raw source files, performs validation, emits a receipt, and does not publish runtime changes.
