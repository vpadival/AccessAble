# AccessAble Backend & Scanner Service

Accessibility audit engine and REST API service powered by Playwright and axe-core.

## Getting Started

### 1. Prerequisites
- Node.js >= 22
- npm >= 9

### 2. Installation
```bash
cd backend
npm ci --ignore-scripts
node node_modules/playwright/cli.js install chromium
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default port is `4000`.

### 4. Running the Server

#### Development (Auto-reload):
```bash
npm run dev
```

#### Start without auto-reload:
```bash
npm start
```

#### Standalone Tests:
```bash
# Test standalone axe-core browser scanner
npm run test:scan

# Test translation layers (toFrontendReport & toAgentJob)
npm run test:transform
```

---

## API Routes Documentation

Base URL: `http://localhost:4000/api/v1`

### 1. Health Check
- **`GET /api/v1/health`**
- Returns service status and current timestamp.
- **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-07T11:25:00.000Z"
  }
  ```

### 2. Initiate Audit Scan
- **`POST /api/v1/scans`**
- Enqueues an asynchronous accessibility audit for the specified target URL.
- **Request Body:**
  ```json
  {
    "targetUrl": "https://example.com",
    "repoUrl": "https://github.com/org/repo",
    "standard": "WCAG 2.2 Level AA"
  }
  ```
- **Response (202 Accepted):**
  ```json
  {
    "scanId": "scan-1762514700000-abc123",
    "status": "scanning",
    "targetUrl": "https://example.com",
    "timestamp": "2026-11-07T11:25:00.000Z"
  }
  ```

### 3. Get Scan Results
- **`GET /api/v1/scans/:scanId`**
- Returns scan status while running (`status: "scanning"`), error if failed, or full audit report when completed.
- **Response (200 OK when completed):**
  ```json
  {
    "status": "completed",
    "metadata": { ... },
    "summary": {
      "currentScore": 72,
      "projectedScore": 100,
      "scoreRating": "Needs Improvement",
      "totalViolations": 18,
      "severityBreakdown": { "critical": 3, "serious": 5, "moderate": 6, "minor": 4 },
      "wcagCompliance": { ... },
      "principlesBreakdown": [ ... ],
      "categoryBreakdown": [ ... ]
    },
    "violations": [ ... ]
  }
  ```

### 4. Get Fix Comparison
- **`GET /api/v1/scans/:scanId/fixes`**
- Returns before and after remediation comparison statistics.
- **Response (200 OK):**
  ```json
  {
    "note": "No fixes applied yet",
    "comparison": {
      "scanId": "scan-1762514700000-abc123",
      "targetUrl": "https://example.com",
      "before": { ... },
      "after": { ... },
      "improvementPercentage": 0,
      "violationsResolved": 0,
      "remainingViolations": 18
    },
    "violations": [ ... ]
  }
  ```

### 5. Get Scan History
- **`GET /api/v1/scans`**
- Returns list of completed audits sorted newest first.
- **Response (200 OK):**
  ```json
  {
    "scans": [
      {
        "id": "scan-1762514700000-abc123",
        "url": "https://example.com",
        "score": 72,
        "violationsCount": 18,
        "criticalCount": 3,
        "status": "Completed",
        "date": "2026-11-07T11:25:00.000Z",
        "standard": "WCAG 2.2 Level AA"
      }
    ]
  }
  ```


## Reports and candidate review

`GET /api/v1/scans/:scanId/report` returns the completed report, or the current scan status.

The `/api/v1/agent-jobs` routes expose job inspection and candidate approval/rejection. Configure `REVIEWER_TOKEN` and `REVIEWER_ID` in the backend environment; requests require a matching bearer token. Keep that credential out of Git and agent access. `AGENT_ARTIFACT_DIR` sets host-owned artifact storage. Review jobs must be published by trusted host code; live Switch publication is not connected.

Approval records permission for an exact candidate digest and does not apply patches, merge branches, or deploy sites.

## Runtime behavior

Local scans and history are stored in memory and reset on restart. A scan request does not authorize source repository access or repairs. The fix-comparison endpoint reports unchanged before/after values until real repair evidence is integrated.

Navigation uses DOM readiness and retries HTTP/2 protocol failures once. Unreachable pages and HTTP error responses fail the scan rather than producing accessibility results. Restart the server after edits when using `npm start`, or use `npm run dev` for automatic reload.

Scores are application-specific severity indicators and do not certify WCAG compliance. See the [project README](../readme.md) for integration checks and limitations.
