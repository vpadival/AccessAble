import { runScan } from '../scanner.js';

/**
 * Placeholder mapping of workspaceId -> targetUrl for this hackathon phase.
 * In a full production deployment, the host environment provisions an isolated
 * candidate workspace checkout (e.g. running a Vite/Next preview server on a local port).
 * For now, this in-memory Map allows the adapter to re-scan the candidate's target URL.
 */
export const workspaceUrlMap = new Map();

/**
 * Scanner Adapter for Member 2's AI agent workflow.
 * Matches the exact contract expected by validate(job, scanner) in agents/src/workflow.js.
 *
 * @param {object} job - Workflow job object (either raw from toAgentJob or state machine job with job.input)
 * @returns {Promise<object>} Validation report matching Member 2's required contract:
 *   {
 *     outcome: 'passed' | 'failed',
 *     remainingViolationIds: string[],
 *     newViolations: string[],
 *     checks: Array<{ profileId: string, status: 'passed' | 'failed' }>,
 *     evidenceArtifactId: string
 *   }
 */
export async function scannerAdapter(job) {
  if (!job) {
    throw new Error('scannerAdapter requires a valid job object.');
  }

  // Support both raw agent format (from toAgentJob) and workflow-wrapped job ({ input: { ... } })
  const effectiveJob = job.input || job;
  const jobId = job.jobId || effectiveJob.jobId || `job-${Date.now()}`;
  const workspaceId = effectiveJob.project?.workspaceId || 'default-workspace';
  const profileId = effectiveJob.scan?.profileId || workspaceId;
  const baselineViolations = Array.isArray(effectiveJob.scan?.violations)
    ? effectiveJob.scan.violations
    : [];

  // 1. Resolve URL from workspaceId mapping or fallback
  const targetUrl = workspaceUrlMap.get(workspaceId);
  if (!targetUrl) throw new Error('Unknown candidate workspace: explicit host registration required');
  if (!job.candidate?.digest) throw new Error('Pinned repair candidate required');

  console.log(`[Adapter] Running validation scan for jobId: ${jobId}, workspaceId: ${workspaceId} -> ${targetUrl}`);

  // 2. Execute a fresh scan on the target candidate page
  const newScanResult = await runScan(targetUrl);
  if (!Array.isArray(newScanResult?.violations)) throw new Error('Invalid scanner result');
  const newViolationsList = Array.isArray(newScanResult?.violations)
    ? newScanResult.violations
    : [];

  // 3. Extract IDs for baseline and new scan results
  const baselineIds = new Set(
    baselineViolations.map((v) => (typeof v === 'string' ? v : v.id)).filter(Boolean)
  );
  const newScanIds = new Set(newViolationsList.map((v) => v.id).filter(Boolean));

  // 4. Compute remaining (unfixed) violations and new (regressed) violations
  // - remainingViolationIds: baseline violations that still appear in the new scan
  const remainingViolationIds = Array.from(baselineIds).filter((id) => newScanIds.has(id));

  // - newViolations: rules violating in the new scan that were NOT in the baseline
  const newViolations = Array.from(newScanIds).filter((id) => !baselineIds.has(id));

  // 5. Determine outcome ('passed' requires 0 remaining AND 0 new regressions)
  const isPassed = remainingViolationIds.length === 0 && newViolations.length === 0;
  const outcome = isPassed ? 'passed' : 'failed';

  // 6. Construct checks array and evidence artifact ID
  const checks = [
    {
      profileId,
      status: outcome,
    },
  ];
  const evidenceArtifactId = `evidence-${jobId}-${Date.now()}`;

  return {
    outcome,
    remainingViolationIds,
    newViolations,
    checks,
    evidenceArtifactId,
  };
}
