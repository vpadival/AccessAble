# AccessAble

AI Web Accessibility Audit Platform.

## Local development

Requires Node.js 22+, npm, and Playwright Chromium.

```sh
npm --prefix backend ci --ignore-scripts
node backend/node_modules/playwright/cli.js install chromium
npm --prefix frontend ci --ignore-scripts
npm --prefix backend start
```

In another terminal:

```sh
npm --prefix frontend run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:3000. Backend listens on loopback port 4000. Frontend uses the live API by default; mocks require explicit opt-in. Scan storage is in memory.

## Verification

```sh
npm --prefix agents test
npm --prefix frontend run build
npm --prefix frontend run lint
node agents/src/scanner-smoke.js
# With backend running:
node agents/src/api-smoke.js
```

## Integration status

Implemented: frontend/backend audit flow, real Playwright + axe scanner, polling and explicit live errors, report retrieval, agent workflow foundation with human approval checks.

Pending: live Switch repair/validation handoff, authorized candidate workspace provisioning, durable validation evidence, authenticated job/approval API and frontend approval integration. Smoke fixture repair is deterministic, not AI-generated. No automatic deployment, merge, or source patch application is part of the application workflow. This is a tested integration baseline, not the complete end-to-end agent product.

See switch/LOCAL-INTEGRATION.md and switch/VALIDATION.md for details.
