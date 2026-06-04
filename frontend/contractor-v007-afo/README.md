# Contractor v0.07 — Binding Layer Cockpit

Worker: `contractor-v007-afo`

Expected preview URL: https://contractor-v007-afo.jaredtechfit.workers.dev/

## Outcome

v007 implements the next binding-layer milestone as far as the available Cloudflare resources currently allow.

### Live in v007

- `BACKEND` service binding preserved: `afo-demo-backend-v001`
- `DB` D1 binding created and attached: `contractor_v007_afo_db`
- D1 database UUID: `f6f5b8e5-b5d1-48c7-b5a5-cb334c81bae2`
- Admin cockpit now supports D1-backed tables for:
  - customers
  - upload metadata
  - knowledge seeds
  - prompt requests
  - receipts

### Planned / blocked until resources exist

- `MEDIA` R2 binding requested, but Cloudflare rejected deployment because bucket `contractor-v007-afo-media` does not exist yet.
- `VECTOR_INDEX` Vectorize binding requested, but Cloudflare rejected deployment because index `contractor-v007-afo-vector` does not exist yet.

v007 therefore queues media metadata and vector seed records into D1 while clearly reporting R2 and Vectorize as planned/not bound.

## Binding status

Live deployed bindings:

```json
[
  {
    "name": "BACKEND",
    "type": "service",
    "service": "afo-demo-backend-v001"
  },
  {
    "name": "DB",
    "type": "d1",
    "id": "f6f5b8e5-b5d1-48c7-b5a5-cb334c81bae2"
  }
]
```

## Admin routes

- `/admin`
- `/admin/bindings.json`
- `/admin/init-db`
- `/admin/customers`
- `/admin/customer`
- `/admin/uploads`
- `/admin/upload`
- `/admin/uploads.json`
- `/admin/media-plan.json`
- `/admin/vector/seed`
- `/admin/vector/query`
- `/admin/prompts.json`
- `/admin/actions.json`
- `/admin/chat`
- `/admin/receipts.json`

## D1 schema

The `/admin/init-db` route creates these tables if missing:

- `customers`
- `upload_metadata`
- `knowledge_seeds`
- `prompt_requests`
- `receipts`

## Upload behavior

Current v007 behavior:

- Upload metadata is stored in D1.
- Files/images/videos/audio binaries are not stored in R2 yet because `MEDIA` is not bound.
- Knowledge seeds are stored in D1 with vector status `pending_vector_index_not_bound`.
- Vector search returns a clear 501-style planned/not-bound response until the Vectorize index exists.

## Safety confirmations

- No production routes created.
- No custom domains added.
- No account IDs added in repo files or UI.
- No secrets added.
- No real auth secrets added.
- v004, v005, and v006 were not modified or redeployed.
- `deployment.confirmed` was not set to true.
- Workers.dev preview only.

## Deployment

Deployment ID: `affb36ee7efb49a6bc18f7948ba41f1a`

Deploy tag: `fb9f42f9e03942ed9dd6729ab63ccb92`

Receipt: `receipts/contractor-v007-afo.deploy.json`

## Smoke-test note

The Worker deployed successfully and metadata confirms `BACKEND` and `DB`. External workers.dev smoke test returned Cloudflare `error code: 1042`, consistent with v005/v006 preview route behavior. No custom domain or production route was added to work around that.
