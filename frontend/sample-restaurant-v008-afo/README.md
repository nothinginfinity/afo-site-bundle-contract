# Sample Restaurant v0.08 AFO

Preview Worker: `sample-restaurant-v008-afo`

URL: https://sample-restaurant-v008-afo.jaredtechfit.workers.dev/

Backend: https://afo-demo-backend-v001.jaredtechfit.workers.dev

## Purpose

v0.08 is the backend-aware restaurant demo that reads the shared AFO Demo Backend v0.01 routes:

- `/menu.json`
- `/articles.json`
- `/media.json`
- `/chat`
- `/leads`
- `/media/IMG_1530.jpeg`

The frontend keeps embedded fallback menu/article/media data so the preview remains resilient if the backend is unavailable.

## Safety

- Preview Worker only.
- No production routes.
- No custom domains.
- No secrets.
- No account IDs in source.
- `deployment.confirmed` not changed.
