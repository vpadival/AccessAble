# AccessAble Frontend

React and Vite dashboard for accessibility scans, reports, and candidate review.

## Local setup

Requires Node.js 22+ and the backend running on port 4000.

```sh
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:3000. Commands above run from this directory.

## Configuration

The default API URL is `http://localhost:4000/api/v1`. Override it with `VITE_API_BASE_URL` in `.env.local`. Demonstration data is opt-in through `VITE_ENABLE_MOCK_DATA=true`; live errors do not silently fall back to mocks. See `.env.example`.

No Gemini API key is required for the current dashboard. Never place secrets in `VITE_` variables, which are exposed to the browser.

## Checks

```sh
npm run build
npm run lint
```

The lint command runs TypeScript checking. The API integration smoke test is documented in the [project README](../readme.md).

## Behavior and limitations

Scans are asynchronous; the dashboard polls until completion or failure. Scores are severity-based indicators, not WCAG conformance certificates. A zero score can represent different sets of findings.

The `/agent-review` page provides a reviewer-token interface for inspecting candidate patches and saved evidence. It requires backend reviewer configuration and trusted host publication of jobs. Live Switch job publication is not connected yet. Approval records permission and does not apply source changes.

Live-mode fix controls do not simulate applying patches. Automated scanning does not replace manual accessibility testing.
