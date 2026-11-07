import app from './server.js';

const TEST_PORT = 4001;

async function runTests() {
  console.log('='.repeat(80));
  console.log('[TEST-API] Starting Express API Automated Tests');
  console.log('='.repeat(80));

  const server = app.listen(TEST_PORT);
  const baseUrl = `http://localhost:${TEST_PORT}/api/v1`;

  try {
    // 1. Health check
    console.log('\n--> 1. Testing GET /api/v1/health');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log(`Status: ${healthRes.status}, Body:`, healthJson);
    if (healthRes.status !== 200 || healthJson.status !== 'ok') {
      throw new Error('Health check test failed.');
    }

    // 2. Scan History
    console.log('\n--> 2. Testing GET /api/v1/scans');
    const scansRes = await fetch(`${baseUrl}/scans`);
    const scansJson = await scansRes.json();
    console.log(`Status: ${scansRes.status}, Scans count: ${scansJson.scans?.length}`);
    if (scansRes.status !== 200 || !Array.isArray(scansJson.scans)) {
      throw new Error('Scan history test failed.');
    }

    // 3. Scan by ID (Seed scan)
    const seedId = 'scan-demo-w3c-bad';
    console.log(`\n--> 3. Testing GET /api/v1/scans/${seedId}`);
    const scanDetailRes = await fetch(`${baseUrl}/scans/${seedId}`);
    const scanDetailJson = await scanDetailRes.json();
    console.log(`Status: ${scanDetailRes.status}, Target: ${scanDetailJson.metadata?.targetUrl}, Score: ${scanDetailJson.summary?.currentScore}`);
    if (scanDetailRes.status !== 200 || !scanDetailJson.metadata || !scanDetailJson.summary) {
      throw new Error('Scan detail test failed.');
    }

    // 4. Scan Fixes comparison
    console.log(`\n--> 4. Testing GET /api/v1/scans/${seedId}/fixes`);
    const fixesRes = await fetch(`${baseUrl}/scans/${seedId}/fixes`);
    const fixesJson = await fixesRes.json();
    console.log(`Status: ${fixesRes.status}, Before score: ${fixesJson.comparison?.before?.score}, After score: ${fixesJson.comparison?.after?.score}`);
    if (fixesRes.status !== 200 || !fixesJson.comparison) {
      throw new Error('Fixes comparison test failed.');
    }

    // 5. Scan Report
    console.log(`\n--> 5. Testing GET /api/v1/scans/${seedId}/report`);
    const reportRes = await fetch(`${baseUrl}/scans/${seedId}/report`);
    const reportJson = await reportRes.json();
    console.log(`Status: ${reportRes.status}, Has metadata: ${!!reportJson.metadata}, Has fixComparison: ${!!reportJson.fixComparison}`);
    if (reportRes.status !== 200 || !reportJson.fixComparison) {
      throw new Error('Report endpoint test failed.');
    }

    // 6. Validation error handling (POST /scans without targetUrl)
    console.log('\n--> 6. Testing POST /api/v1/scans validation error');
    const invalidPostRes = await fetch(`${baseUrl}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const invalidJson = await invalidPostRes.json();
    console.log(`Status: ${invalidPostRes.status}, Error message: ${invalidJson.error}`);
    if (invalidPostRes.status !== 400) {
      throw new Error('Validation error handling failed.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('[TEST-API] All 6 API endpoint tests passed successfully!');
    console.log('='.repeat(80));
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('[TEST-API] Test suite failed:', err);
  process.exit(1);
});
