# Contractor v0.06 Upload Cockpit Plan

v006 introduces the upload cockpit foundation Jared described.

## Supported UI concepts in v006

- File upload input
- Image upload input
- Video upload input
- Audio / voice note route foundation
- Customer/site ID field
- Title field
- Notes field
- Staged upload response JSON
- Media plan endpoint
- Future D1/R2/Vectorize binding checklist

## Current write mode

`dry_run_staged_only`

v006 does not persist binary files or mutate databases because only the `BACKEND` service binding is attached.

## Future real-write mode

A later confirmed version should add explicit bindings:

- `DB` D1 binding for upload metadata, customer/site rows, prompt requests, knowledge seeds, and receipts
- `MEDIA` R2 bucket binding for files, images, videos, and voice recordings
- `VECTOR_INDEX` Vectorize binding for transcript/document/site knowledge embeddings

## Recommended future flow

1. Admin logs in.
2. Admin uploads files/images/videos/audio.
3. Worker writes binary asset to R2.
4. Worker writes metadata to D1.
5. Worker extracts or accepts text/transcript.
6. Worker writes embeddings to Vectorize.
7. Admin generates a ChatGPT/Claude/Alice/MCP update prompt.
8. A receipt is written for all changes.

## Safety

Real writes should require:

- explicit user confirmation
- bound D1/R2/Vectorize resources
- preview-only environment flag
- receipt write
- no production route/custom domain
- no account IDs or secrets in UI
