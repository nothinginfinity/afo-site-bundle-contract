# Contractor v0.07 — Binding Layer Cockpit

Worker: `contractor-v007-afo`

Expected preview URL: https://contractor-v007-afo.jaredtechfit.workers.dev/

## Current outcome

v007 now has the live binding layer Jared requested for D1 + R2.

### Live in v007

- `BACKEND` service binding preserved: `afo-demo-backend-v001`
- `DB` D1 binding attached: `contractor_v007_afo_db`
- D1 database UUID: `f6f5b8e5-b5d1-48c7-b5a5-cb334c81bae2`
- `MEDIA` R2 binding attached to existing bucket: `afo-site-content`

### Planned / still needed

- `VECTOR_INDEX` Vectorize binding is still planned.
- Earlier deployment with `VECTOR_INDEX -> contractor-v007-afo-vector` was rejected because the Vectorize index does not exist yet.

## What the cockpit can do now

- Store customer records in D1.
- Store upload metadata in D1.
- Store files/images/videos/audio binaries in R2 bucket `afo-site-content` through binding `MEDIA`.
- Store knowledge seed records in D1 as pending vector indexing.
- Store prompt requests in D1.
- Provide binding status from `/admin/bindings.json` and `/health`.

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
- Binary media is stored in R2 under keys like:
  - `contractor-v007/uploads/{site_id}/{upload_id}/{filename}`
- Knowledge seeds are stored in D1 with vector status `pending_vector_index_not_bound`.
- Vector search returns a clear planned/not-bound response until the Vectorize index exists and is attached.

## Live binding metadata

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
  },
  {
    "name": "MEDIA",
    "type": "r2_bucket",
    "bucket_name": "afo-site-content"
  }
]
```

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

Latest deployment ID after R2 binding update: `11617a26bd994d4cad6988fceab34a1e`

Latest etag: `59f8fc1cff6ef36ccaaeee0abe747c43b6e573b99a9413bed95e821a9e3d3761`

Receipt: `receipts/contractor-v007-afo.deploy.json`
