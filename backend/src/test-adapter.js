import { runScan } from './scanner.js';
import { toAgentJob } from './transformers/toAgentFormat.js';
import { scannerAdapter } from './adapters/agentAdapter.js';

const TEST_URL = 'https://www.w3.org/WAI/demos/bad/before/home.html';
const SAMPLE_COMMIT = 'c49307ef529a5ad3f0e510dbdd8d9c92ef22abf8';

async function main() {
  console.log('='.repeat(80));
  console.log('[TEST-ADAPTER] Starting Member 2 Scanner Adapter Validation Test');
  console.log('='.repeat(80));

  console.log(`\n1. Running baseline audit for ${TEST_URL}...`);
  const baselineResults = await runScan(TEST_URL);
  console.log(`Baseline scan returned ${baselineResults.violations.length} distinct violations.`);

  // 1. Build initial agent job using toAgentJob()
  const agentJob = toAgentJob(baselineResults, {
    jobId: 'job-validation-test-001',
    workspaceId: 'trusted-demo',
    baseCommit: SAMPLE_COMMIT,
  });

  console.log('\n2. Calling scannerAdapter(agentJob) on the candidate workspace...');
  console.log('Note: Re-scanning the same unfixed page should return outcome: "failed" with remaining violations.');

  const validationReport = await scannerAdapter(agentJob);

  console.log('\n' + '='.repeat(80));
  console.log('ADAPTER VALIDATION OUTPUT (Member 2 Contract):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(validationReport, null, 2));

  // Verification checks against Member 2 workflow contract assertions
  console.log('\n' + '='.repeat(80));
  console.log('CONTRACT CONFORMANCE CHECKS:');
  console.log('='.repeat(80));

  const checks = [
    {
      name: 'Outcome is "passed" or "failed"',
      pass: ['passed', 'failed'].includes(validationReport.outcome),
      value: validationReport.outcome,
    },
    {
      name: 'remainingViolationIds is an Array',
      pass: Array.isArray(validationReport.remainingViolationIds),
      value: `${validationReport.remainingViolationIds?.length} remaining`,
    },
    {
      name: 'newViolations is an Array',
      pass: Array.isArray(validationReport.newViolations),
      value: `${validationReport.newViolations?.length} new regressions`,
    },
    {
      name: 'checks is a non-empty Array',
      pass: Array.isArray(validationReport.checks) && validationReport.checks.length > 0,
      value: `${validationReport.checks?.length} checks`,
    },
    {
      name: 'evidenceArtifactId is a non-empty string',
      pass: typeof validationReport.evidenceArtifactId === 'string' && validationReport.evidenceArtifactId.length > 0,
      value: validationReport.evidenceArtifactId,
    },
    {
      name: 'Correctly marked "failed" for unfixed candidate',
      pass: validationReport.outcome === 'failed' && validationReport.remainingViolationIds.length > 0,
      value: `Outcome: ${validationReport.outcome}`,
    },
  ];

  for (const c of checks) {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name} (${c.value})`);
  }

  const allPassed = checks.every((c) => c.pass);
  if (!allPassed) {
    throw new Error('Contract conformance check failed.');
  }

  console.log('\n[TEST-ADAPTER] All contract conformance checks passed cleanly!');
}

main().catch((err) => {
  console.error('[TEST-ADAPTER] Test error:', err);
  process.exit(1);
});
