# AFO Contractor Demo v0.04 — CCS Services Group

Worker: `contractor-v004-afo`  
URL: https://contractor-v004-afo.jaredtechfit.workers.dev/  
Version: `0.04`  
Binding: `BACKEND -> afo-demo-backend-v001`

## What changed from v0.03

v0.04 keeps the contractor demo isolated as a new Worker and adds a stronger conversion layer around estimate capture and chat.

### CTA and button upgrades

- Stronger hero CTA placement with three immediate actions:
  - `Call for Free Estimate`
  - `Get Estimate`
  - `Chat with Project Assistant`
- Mobile sticky CTA bar with:
  - `Get Estimate`
  - `Chat`
- Service-card CTAs now pre-select or guide users toward the estimate form.
- Project-card CTAs guide users to request a similar project estimate.
- Chat suggested actions include call, estimate, and follow-up chat paths.

### Chat and knowledge-base behavior

- `/chat` supports POST requests.
- Chat first attempts the `BACKEND` service binding to `afo-demo-backend-v001`.
- If backend chat is unavailable, v0.04 falls back to local preview knowledge chunks.
- Answers include citations and suggested actions.

### Lead capture behavior

- `/leads` supports POST requests.
- The estimate form collects:
  - name
  - phone
  - service
  - budget
  - timeline
  - message
- Lead submission attempts to forward through the backend service binding.
- If backend lead routing is unavailable, the preview returns a safe acknowledgement.

### Routes

| Route | Description |
|---|---|
| `/` | Full HTML contractor demo |
| `/health` | Worker health and backend binding check |
| `/services.json` | Service registry |
| `/projects.json` | Sample project cards |
| `/knowledge.json` | Local preview knowledge chunks |
| `/articles.json` | Contractor education articles |
| `/chat` | Knowledge-grounded chat route |
| `/leads` | Estimate lead capture route |
| `/schema.json` | LocalBusiness schema |
| `/llms.txt` | LLM contract |
| `/robots.txt` | Robots policy |
| `/sitemap.xml` | Sitemap |

## Deploy result

- Worker: `contractor-v004-afo`
- Deployment ID: `67d12db23b87441b81ea5159a270bf89`
- Service binding: `BACKEND -> afo-demo-backend-v001`
- Preview URL: https://contractor-v004-afo.jaredtechfit.workers.dev/

## Safety

- No prior contractor versions modified or redeployed.
- No production routes added.
- No custom domains added.
- No account IDs exposed.
- No secrets exposed.
- `deployment.confirmed` not changed.
- Preview-only workers.dev deployment.
