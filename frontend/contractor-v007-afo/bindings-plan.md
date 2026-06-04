# Contractor v0.07 Binding Plan

## Requested binding layer

Jared requested:

- `DB` D1 binding for customers, upload metadata, knowledge seeds, prompt requests, receipts
- `MEDIA` R2 bucket for files, images, videos, voice/audio recordings
- `VECTOR_INDEX` Vectorize binding for semantic search over transcripts, docs, articles, site knowledge

## What is live now

### D1

Created database:

- name: `contractor_v007_afo_db`
- UUID: `f6f5b8e5-b5d1-48c7-b5a5-cb334c81bae2`

Attached to Worker as:

```json
{
  "type": "d1",
  "name": "DB",
  "id": "f6f5b8e5-b5d1-48c7-b5a5-cb334c81bae2"
}
```

### R2

Attached existing bucket:

```json
{
  "type": "r2_bucket",
  "name": "MEDIA",
  "bucket_name": "afo-site-content"
}
```

This enables media storage for files, images, videos, and audio/voice recordings through `env.MEDIA`.

## What is still blocked

### Vectorize

Attempted binding:

```json
{
  "type": "vectorize",
  "name": "VECTOR_INDEX",
  "index_name": "contractor-v007-afo-vector"
}
```

Cloudflare rejected deploy because the Vectorize index does not exist yet.

Required next step: create Vectorize index `contractor-v007-afo-vector`, then redeploy with `VECTOR_INDEX` binding.

## v007 behavior while Vectorize is blocked

- Upload metadata is stored in D1.
- Binary files/images/videos/audio are stored in R2 bucket `afo-site-content`.
- Knowledge seeds are stored in D1.
- Vector work is marked `pending_vector_index_not_bound`.
- `/admin/bindings.json` and `/admin/media-plan.json` report the live/planned binding state.
