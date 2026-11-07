import { createHash } from 'node:crypto';
import { realpath } from 'node:fs/promises';
import { relative, isAbsolute, sep } from 'node:path';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

/** Resolve both paths, including symlinks. Call before each filesystem operation. */
export async function authorizedPath(root, target) {
  const [base, resolved] = await Promise.all([realpath(root), realpath(target)]);
  const rel = relative(base, resolved);
  assert(rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel), 'Path escapes authorized workspace');
  return resolved;
}

export function createJob(input) {
  assert(input?.schemaVersion === '1.0', 'Unsupported schemaVersion');
  assert(typeof input.jobId === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(input.jobId), 'Invalid jobId');
  assert(typeof input.project?.workspaceId === 'string' && input.project.workspaceId.length > 0, 'Missing workspaceId');
  assert(/^[a-f0-9]{40}$/.test(input.project.baseCommit), 'Expected full base commit SHA');
  assert(typeof input.scan?.profileId === 'string', 'Missing trusted scan profile');
  assert(Array.isArray(input.scan.violations), 'Missing violations');
  for (const v of input.scan.violations) {
    assert(typeof v.id === 'string' && Array.isArray(v.nodes), 'Invalid axe violation');
    for (const node of v.nodes) assert(Array.isArray(node.target), 'Preserve axe target arrays');
  }
  return { schemaVersion: '1.0', jobId: input.jobId, status: 'received', input: structuredClone(input), attempts: 0, appliedToOriginal: false };
}

export function beginRepair(job) {
  assert(['received', 'needs_revision'].includes(job.status), 'Invalid repair transition');
  assert(job.attempts < 2, 'Repair attempt limit reached');
  return { ...job, status: 'repairing', attempts: job.attempts + 1, candidate: null, validation: null, approval: null };
}

export function propose(job, { patch, changedFiles }) {
  assert(job.status === 'repairing', 'Job must be repairing');
  assert(typeof patch === 'string' && patch.length > 0, 'Empty patch');
  assert(Array.isArray(changedFiles) && changedFiles.length > 0, 'Missing changedFiles');
  for (const file of changedFiles) assert(typeof file === 'string' && !isAbsolute(file) && !file.split(/[\\/]/).includes('..'), 'Unsafe candidate path');
  // This module stores proposals; it never executes or applies patch contents.
  const candidate = { baseCommit: job.input.project.baseCommit, patch, changedFiles: [...changedFiles] };
  return { ...job, status: 'validating', candidate: { ...candidate, digest: hash(candidate) } };
}

export async function validate(job, scanner) {
  assert(job.status === 'validating', 'Job must be validating');
  assert(typeof scanner === 'function', 'Member 1 scanner adapter required');
  // Adapter is supplied by trusted host code, never constructed from scanner JSON.
  try {
    const report = await scanner(structuredClone(job));
    assert(['passed', 'failed'].includes(report?.outcome), 'Invalid validation outcome');
    assert(Array.isArray(report.remainingViolationIds) && Array.isArray(report.newViolations), 'Missing comparison evidence');
    assert(Array.isArray(report.checks) && report.checks.length > 0, 'Missing validation checks');
    assert(typeof report.evidenceArtifactId === 'string' && report.evidenceArtifactId.length > 0, 'Missing evidence artifact');
    const passed = report.outcome === 'passed' && report.remainingViolationIds.length === 0 && report.newViolations.length === 0 && report.checks.every(c => c.status === 'passed');
    const validation = structuredClone(report);
    return { ...job, validation, status: passed ? 'awaiting_approval' : 'needs_revision', approval: passed ? { required: true, decision: 'pending', candidateDigest: job.candidate.digest, evidenceDigest: hash(validation) } : null };
  } catch (error) {
    return { ...job, status: 'failed', error: String(error.message), approval: null };
  }
}

/** principal MUST come from authenticated host/session context, not an agent payload. */
export function decide(job, decision, principal, authorizedReviewers) {
  assert(job.status === 'awaiting_approval', 'Job is not awaiting approval');
  assert(principal?.kind === 'human' && authorizedReviewers.includes(principal.id), 'Unauthorized reviewer');
  assert(['approved', 'rejected'].includes(decision.decision), 'Invalid approval decision');
  const { digest, ...candidate } = job.candidate;
  assert(hash(candidate) === digest && digest === decision.candidateDigest && digest === job.approval.candidateDigest, 'Candidate changed or approval is stale');
  assert(hash(job.validation) === job.approval.evidenceDigest, 'Validation evidence changed');
  return { ...job, status: decision.decision, approval: { ...job.approval, decision: decision.decision, reviewerId: principal.id, decidedAt: new Date().toISOString() } };
}

export function handoff(job) {
  assert(job.status === 'validating', 'No validation handoff available');
  return { schemaVersion: '1.0', jobId: job.jobId, nextAgent: 'accessable-validation', candidateDigest: job.candidate.digest, baseCommit: job.candidate.baseCommit, changedFiles: job.candidate.changedFiles };
}
