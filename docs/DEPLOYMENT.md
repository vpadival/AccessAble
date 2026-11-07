# Deploy a limited public demo

This deployment serves the frontend and scanner API. Switch/Codex still runs separately on the operator machine; live agent handoff and approval integration remain pending. No deployment is performed by these files.

## 1. Push the configuration

Commit and push feature/ai-switch-integration. Deploy that branch for preview, or merge its reviewed PR and select main. Both hosts must use the combined branch containing frontend/ and backend/.

## 2. Render backend

Create New → Web Service and connect this repository.

- Branch: combined integration branch (or reviewed main).
- Root Directory: backend.
- Language/runtime: Docker.
- Dockerfile: ./Dockerfile (relative to backend root).
- Health Check Path: /api/v1/health.
- Docker command: leave empty to use CMD.
- Choose enough memory for Chromium; use an always-on service for predictable demos.

Set environment variables:

```text
NODE_ENV=production
HOST=0.0.0.0
ALLOWED_ORIGINS=https://YOUR-PROJECT.vercel.app
SCAN_ALLOWED_HOSTS=www.w3.org
```

Render supplies PORT. Use your exact final Vercel origin (no trailing slash). Until it is known, use a placeholder then update before browser testing. Do not use wildcard origins. SCAN_ALLOWED_HOSTS is a comma-separated list of trusted public HTTPS hostnames only, not URLs. All scanner HTTP subresources must also be on that list; blocked assets can change scan results. Start with https://www.w3.org/WAI/demos/bad/before/home.html. Do not allow attacker-controlled hosts or private DNS names; this policy is not a general SSRF sandbox. Arbitrary-site scanning needs network-level egress protection and authenticated per-user quotas.

## 3. Vercel frontend

Import the same Git repository as a Vercel project.

- Root Directory: frontend.
- Framework: Vite.
- Install: npm ci.
- Build: npm run build.
- Output: dist.
- Node: 22.x.

Set build-time environment variables:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_SCAN_TIMEOUT_MS=30000
```

Deploy. Copy its final origin into Render ALLOWED_ORIGINS and redeploy the backend. Set variables separately for Preview and Production if using both. Frontend URL changes require CORS updates; backend URL changes require a new frontend build. Never put credentials in VITE_ variables.

## 4. Acceptance checks

- GET backend /api/v1/health returns status ok.
- Open frontend and refresh a nested page; SPA routes still load.
- Submit the approved W3C URL; wait for a real completed scan.
- Reports and comparison load; no simulated scan success is substituted.
- Submit an unapproved hostname: API returns 403.
- Submit a second scan while busy or within cooldown: API returns 429.
- Live fix actions must not claim original source changes were applied.

## Operational limits

Scan results are public, shared, in memory and bounded to 100 entries; do not scan private content. Restart/redeploy loses history and in-progress scans. Only one API process/instance is intended for this demo; in-memory cooldown is not a distributed rate limiter. Production accepts only trusted allowlisted HTTPS sites. There is no user authentication or private job storage. Keep the local agent host and secrets off public endpoints. Docker image build and hosted behavior must be verified on Render; local source/build checks do not certify the image.

## Local checks

```sh
node --test backend/tests/*.test.js
npm --prefix agents test
npm --prefix frontend run build
npm --prefix frontend run lint
node agents/src/scanner-smoke.js
```

Optional Docker verification from repository root:

```sh
docker build -t accessable-backend backend
docker run --rm -p 4000:4000 -e ALLOWED_ORIGINS=http://localhost:3000 -e SCAN_ALLOWED_HOSTS=www.w3.org accessable-backend
```

Official references:
- https://render.com/docs/docker
- https://render.com/docs/web-services
- https://vercel.com/docs/frameworks/frontend/vite
- https://playwright.dev/docs/docker
