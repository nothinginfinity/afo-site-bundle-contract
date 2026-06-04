# Contractor v0.06 — Connected Contractor + Site Manager Cockpit Demo

Worker: `contractor-v006-afo`

Expected preview URL: https://contractor-v006-afo.jaredtechfit.workers.dev/

## Purpose

v006 connects the v004 public contractor demo and the v005 admin prompt cockpit into a new connected site-manager cockpit shell.

It does **not** modify or redeploy v004 or v005. It links to them and preserves their role in the workflow:

- v004: public contractor demo reference
- v005: admin prompt cockpit reference
- v006: connected cockpit with admin dropdown, staged uploads, media planning, and voice-note foundation

## What was added

- Public demo dropdown menu with:
  - v006 connected cockpit
  - v004 public demo link
  - v005 admin demo link
  - Admin login
  - Upload cockpit
  - Featured project
- Password-gated `/admin` using demo password `demo`
- `/admin/uploads` cockpit page for files, images, videos, voice notes, and knowledge seeds
- `/admin/upload` staged/dry-run upload endpoint
- `/admin/uploads.json` staged upload queue placeholder
- `/admin/recordings` voice recording cockpit foundation
- `/admin/media-plan.json` future D1/R2/Vectorize binding plan
- Existing contractor routes preserved from v005/v004 surface

## Upload scope

Jared asked for admin upload support for:

- files
- images
- videos
- voice recordings
- D1 database upload/seed
- R2 media storage
- future Vectorize/vector database ingestion

v006 includes the cockpit UX and safe API foundations, but does not perform real D1/R2/Vectorize writes yet because those bindings were not attached in this version.

Current upload mode:

```json
{
  "preview_only": true,
  "write_mode": "dry_run_staged_only",
  "mutated": {
    "d1": false,
    "r2": false,
    "vectorize": false,
    "github": false,
    "cloudflare": false
  }
}
```

Future binding plan:

```json
[
  {
    "type": "d1",
    "name": "DB",
    "purpose": "metadata, customers, upload queue, knowledge seeds"
  },
  {
    "type": "r2_bucket",
    "name": "MEDIA",
    "purpose": "files, images, videos, audio/voice recordings"
  },
  {
    "type": "vectorize",
    "name": "VECTOR_INDEX",
    "purpose": "semantic search over transcripts, docs, articles, site knowledge"
  }
]
```

## Service binding

Preserved:

```json
{
  "type": "service",
  "name": "BACKEND",
  "service": "afo-demo-backend-v001"
}
```

No other bindings were added in v006.

## Safety confirmations

- No production routes created
- No custom domains added
- No account IDs added
- No secrets added
- No real auth secrets added
- No bindings except `BACKEND -> afo-demo-backend-v001`
- v004 and v005 were not modified or redeployed
- Upload endpoints are staged/dry-run only
- Admin password `demo` is clearly labeled preview-only and not production security

## Deployment

Deployment ID: `465c9f6bd51c49389983a7739b8dc144`

Deploy tag: `79137096339e47f3a03724af6fcfffba`

Receipt: `receipts/contractor-v006-afo.deploy.json`

## Smoke-test note

The Worker deployed successfully and metadata confirms the `BACKEND` service binding. External smoke testing of the expected workers.dev URL returned Cloudflare error code `1042`, same as v005. No custom domain or production route was added to work around this.
