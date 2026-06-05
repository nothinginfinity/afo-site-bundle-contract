# contractor-v003-1-afo connectivity patch

Target Worker: `contractor-v003-1-afo` only.

This patch is scoped to the CCS Services Group v003.1 contractor demo. Original `contractor-v003-afo` and `contractor-v004-afo` through `contractor-v008-afo` are protected and must remain untouched.

## Intended connectivity fixes

- Add `/health` as an alias for `/api/status`.
- Add `/api/search` as an alias for `/api/knowledge