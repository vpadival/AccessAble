# AccessAble Backend & Scanner Service

Accessibility audit engine and REST API service powered by Playwright and axe-core.

## Getting Started

### 1. Prerequisites
- Node.js >= 20
- npm >= 9

### 2. Installation
```bash
cd backend
npm install
npx playwright install chromium
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

#### Production:
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
