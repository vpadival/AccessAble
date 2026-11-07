# Local frontend/backend integration

Run backend: `npm --prefix backend start` (loopback port 4000).
Run frontend: `npm --prefix frontend run dev -- --host 127.0.0.1` (port 3000).
Frontend defaults to live local API; demonstration mode requires explicit VITE_ENABLE_MOCK_DATA=true.

Verified acceptance: `node agents/src/api-smoke.js` while backend is running. Uses the actual frontend API service, async polling, backend Playwright/axe scanner and local fixture. Asserts live results, report and comparison endpoints and explicit missing-scan failure. No browser UI automation was performed.

Also run `npm --prefix frontend run build`, `npm --prefix frontend run lint`, `npm --prefix agents test`, `node agents/src/scanner-smoke.js`.

Changes to Member 1 interfaces: report route added, loopback binding, explicit CORS origins, audit-only results no longer generate source jobs with fake revisions; unknown adapter workspace fails instead of falling back. Member 3 changes: local API default, opt-in mocks, live error propagation, async scan polling, empty history handling, real completion messages, no local simulated patch application in live mode.

Remaining separate Switch integration: authenticated candidate/job API, persistent evidence, authorized source checkout binding and live two-agent handoff/approval ingestion. No automatic merge/deploy/application exists. Local audit flow is functional independently. Backend scan storage is in-memory and resets on restart.
