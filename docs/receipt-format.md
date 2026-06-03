# AFO Validation Receipt Format

Receipt schema: `afo.mobile_terminal.validation_receipt`
Schema version: `1.0.0`

Receipts are GitHub-written audit artifacts. They record what AFO Mobile Terminal validated, what it planned, and whether any runtime action happened. For this dry-run integration layer, runtime deployment must remain false.

## Required top-level fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `receipt_schema` | string | yes | Must be `afo.mobile_terminal.validation_receipt`. |
| `receipt_schema_version` | string | yes | Must be `1.0.0`. |
| `receipt_type` | string | yes | For this layer, use `validation_dry_run`. |
| `generated_at` | string | yes | ISO-8601 timestamp. |
| `actor` | string | yes | Expected value: `afo-mobile-terminal`. |
| `dry_run` | boolean | yes | Must be `true` for this integration layer. |
| `deployed` | boolean | yes | Must be `false`. |
| `production_deploy_attempted` | boolean | yes | Must be `false`. |
| `source` | object | yes | GitHub source inputs. |
| `result` | object | yes | Overall validation status. |
| `checks` | array | yes | Individual validation checks. |
| `preview_plan` | object or null | yes | Preview-only command plan. |
| `smoke_test_plan` | object or null | yes | Planned smoke tests; no live runtime required. |
| `write_back` | object | yes | Intended GitHub receipt write target. |

## Source object

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

## Result object

```json
{
  "passed": true,
  "errors": [],
  "warnings": []
}
```

`passed` is true only when every required validation and safety gate passes.

## Check object

Each entry in `checks` should include:

```json
{
  "name": "deployment_confirmed_false",
  "passed": true,
  "actual": false
}
```

Recommended check names:

- `bundle_schema_validation`
- `bundle_schema_name`
- `bundle_schema_version`
- `deployment_mode`
- `deployment_confirmed_false`
- `deployment_environment_preview`
- `worker_routes_empty`
- `worker_file_package.json`
- `worker_file_wrangler.toml`
- `worker_file_src/index.ts`
- `wrangler_preview_safety`
- `wrangler_compatibility_date`
- `worker_dev_script_safe`
- `worker_preview_script_safe`
- `worker_deploy_script_blocked`
- `worker_route_/`
- `worker_route_/health`
- `worker_route_/llms.txt`
- `worker_route_/robots.txt`
- `worker_route_/sitemap.xml`
- `worker_route_/schema.json`

## Safety gates

A dry-run validation receipt must fail if any of these are not true:

- `schema` is `afo.site.bundle`
- `schema_version` is `1.0.0`
- `deployment.deploy_mode` is `preview_first`
- `deployment.confirmed` is `false`
- `deployment.environment` is `preview`
- `worker.routes` is an empty array
- `wrangler.toml` has no production routes
- `wrangler.toml` has no account-scoped identifiers
- `wrangler.toml` has no custom domains
- `wrangler.toml` has no environment variable block
- `wrangler.toml` has no guarded credential-like keys
- Worker deploy script remains blocked and exits non-zero

## Preview plan

`preview_plan` records what would be run later for preview only. It must not execute deployment in this dry-run layer.

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

## Smoke test plan

`smoke_test_plan` records route expectations for a future preview URL.

```json
{
  "mode": "plan_only",
  "requires_preview_url": true,
  "routes": [
    { "path": "/", "expected_status": 200, "expected_content_type": "text/html" },
    { "path": "/health", "expected_status": 200, "expected_content_type": "application/json" },
    { "path": "/llms.txt", "expected_status": 200, "expected_content_type": "text/plain" },
    { "path": "/robots.txt", "expected_status": 200, "expected_content_type": "text/plain" },
    { "path": "/sitemap.xml", "expected_status": 200, "expected_content_type": "application/xml" },
    { "path": "/schema.json", "expected_status": 200, "expected_content_type": "application/json" }
  ]
}
```

## Write-back object

```json
{
  "intended_path": "receipts/example-business.validation.dry-run.json",
  "command": "write_validation_receipt",
  "status": "written_locally"
}
```

A Mobile Terminal implementation may write this receipt to GitHub only after all dry-run validation checks pass. The receipt write is not a deployment.
