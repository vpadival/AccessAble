/**
 * Converts raw axe-core results into the schema expected by Member 2's AI agent workflow.
 * Reference: agents/fixtures/scan.example.json & agents/src/workflow.js
 *
 * @param {object} rawAxeResults - Unmodified result from axe.analyze()
 * @param {object} options
 * @param {string} options.jobId - Unique identifier for the audit repair job
 * @param {string} options.workspaceId - Trusted identifier for target workspace
 * @param {string} options.baseCommit - 40-character Git commit SHA
 * @returns {object} Formatted job object for Member 2's workflow engine
 */
export function toAgentJob(rawAxeResults, { jobId, workspaceId, baseCommit } = {}) {
  const safeJobId = jobId || `job-${Date.now()}`;
  const safeWorkspaceId = workspaceId || 'default-workspace';
  const normalizedCommit = (baseCommit || '').trim().toLowerCase();

  // Member 2's workflow strictly asserts /^[a-f0-9]{40}$/.test(input.project.baseCommit)
  if (!/^[a-f0-9]{40}$/.test(normalizedCommit)) {
    throw new Error(
      `Invalid baseCommit "${baseCommit}". Member 2 agent workflow requires a valid 40-character Git commit SHA.`
    );
  }

  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(safeJobId)) {
    throw new Error(`Invalid jobId "${safeJobId}". Must match ^[a-zA-Z0-9_-]{1,80}$.`);
  }

  const rawViolations = Array.isArray(rawAxeResults?.violations)
    ? rawAxeResults.violations
    : [];

  const violations = rawViolations.map((v) => ({
    id: v.id,
    impact: v.impact || 'minor',
    nodes: Array.isArray(v.nodes)
      ? v.nodes.map((node) => ({
          target: Array.isArray(node.target) ? node.target : [String(node.target || 'body')],
          html: node.html || '',
        }))
      : [],
  }));

  return {
    schemaVersion: '1.0',
    jobId: safeJobId,
    project: {
      workspaceId: safeWorkspaceId,
      baseCommit: normalizedCommit,
    },
    scan: {
      profileId: safeWorkspaceId,
      violations,
    },
  };
}
