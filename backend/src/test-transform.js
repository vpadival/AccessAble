import { runScan } from './scanner.js';
import { toAgentJob } from './transformers/toAgentFormat.js';
import { toFrontendReport } from './transformers/toFrontendFormat.js';

const TEST_URL = 'https://www.w3.org/WAI/demos/bad/before/home.html';
const SAMPLE_COMMIT = 'c49307ef529a5ad3f0e510dbdd8d9c92ef22abf8'; // Full 40-char SHA

async function main() {
  console.log('='.repeat(80));
  console.log(`[TEST-TRANSFORM] Scanning: ${TEST_URL}`);
  console.log('='.repeat(80));

  const start = Date.now();
  const rawResults = await runScan(TEST_URL);
  const durationSeconds = Number(((Date.now() - start) / 1000).toFixed(2));

  console.log(`Scan completed in ${durationSeconds}s. Raw violations count: ${rawResults.violations.length}\n`);

  // 1. Transform to Member 2 AI Agent Format
  console.log('='.repeat(80));
  console.log('1. MEMBER 2 AGENT JOB FORMAT (toAgentJob):');
  console.log('='.repeat(80));
  const agentJob = toAgentJob(rawResults, {
    jobId: 'job-demo-001',
    workspaceId: 'trusted-demo',
    baseCommit: SAMPLE_COMMIT,
  });
  console.log(JSON.stringify(agentJob, null, 2));

  // 2. Transform to Member 3 Frontend Report Format
  console.log('\n' + '='.repeat(80));
  console.log('2. FRONTEND AUDIT REPORT FORMAT (toFrontendReport):');
  console.log('='.repeat(80));
  const frontendReport = toFrontendReport(rawResults, {
    scanId: 'scan-demo-001',
    targetUrl: TEST_URL,
    repoUrl: 'https://github.com/vpadival/AccessAble',
    standard: 'WCAG 2.2 Level AA',
    durationSeconds,
  });

  console.log(JSON.stringify(frontendReport, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('[TEST-TRANSFORM] Both transformations succeeded cleanly!');
  console.log('='.repeat(80));
}

main().catch((err) => {
  console.error('[TEST-TRANSFORM] Error:', err);
  process.exit(1);
});
