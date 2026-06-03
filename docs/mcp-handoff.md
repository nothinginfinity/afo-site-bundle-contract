# MCP Handoff Protocol

This document describes how AFO MCPs pass an AFO Site Bundle between generation, validation, deployment, smoke testing, registration, and receipts.

## Source of Truth

GitHub is always the source of truth. MCPs should read the bundle from GitHub before acting and should write updated state back to GitHub after acting.

## Ownership

AFO Micro SEO Site Builder owns:

- `client`
- `site`
- `content`
- `discovery`
- `schema_jsonld`
- `smoke_tests.routes`

AFO Mobile Terminal owns:

- `worker`
- `repo`
- `validation`
- `deployment`
- `smoke_tests.last_smoke_test`
- `registry`
- `handoff`

## Handoff Flow

| Status | Next action | Next agent |
|---|---|---|
| `generated` | `validate_worker` | `afo-mobile-terminal-mcp` |
| `validated` | `prepare_preview` | `afo-mobile-terminal-mcp` |
| `preview_ready` | `preview_worker_deploy` | `afo-mobile-terminal-mcp` |
| `preview_deployed` | `run_smoke_tests` | `afo-mobile-terminal-mcp` |
| `smoke_tested` | `operator_review` | `operator` |
| `production_ready` | `deploy_worker_confirmed` | `afo-mobile-deploy-mcp` |
| `production_deployed` | `register_worker` | `afo-mobile-terminal-mcp` |
| `registered` | `write_receipt` | `afo-mobile-terminal-mcp` |
| `receipted` | `none` | `none` |

## Confirmation Rule

Production deployment must not happen unless `deployment.confirmed` is explicitly true. Preview, validation, and smoke-test operations should remain safe and non-production by default.
