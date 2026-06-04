# Sample Restaurant v0.09 AFO

Preview Worker: `sample-restaurant-v009-afo`

URL: https://sample-restaurant-v009-afo.jaredtechfit.workers.dev/

Backend: https://afo-demo-backend-v001.jaredtechfit.workers.dev

## v0.09 objectives

1. Stabilize backend routes: `/menu.json`, `/articles.json`, `/chat`, `/leads`.
2. Add a simple interactive chat demo that posts to backend `/chat` and displays responses.
3. Improve fallback UX with a visible banner: `Backend temporarily unavailable — using cached data`, plus a Retry button.
4. Update `/schema.json` and `/llms.txt` with backend status and contract discovery.
5. Add simple security/scope on mutating routes: backend rate limits `/chat`, `/leads`, and admin actions; `/leads` supports the preview header `X-AFO-Demo-Token: preview-demo`.

## Frontend routes

- `/`
- `/health`
- `/menu.json`
- `/articles.json`
- `/media.json`
- `/chat`
- `/leads`
- `/media/IMG_1530.jpeg`
- `/schema.json`
- `/llms.txt`
- `/robots.txt`
- `/sitemap.xml`

## Safety

- Preview Worker only.
- No production routes.
- No custom domains.
- No secrets.
- No account IDs in source.
- `deployment.confirmed` not changed.
