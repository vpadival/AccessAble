/** Reuses a host-supplied Member 1 scanner and saves actual before/after evidence. */
export function evidenceAdapter({ scan, store, resolveCandidate }) {
  return async job => {
    const target = await resolveCandidate(job.input.project.workspaceId, job.candidate.digest);
    if (!target || target.candidateDigest !== job.candidate.digest || target.baseCommit !== job.candidate.baseCommit) throw new Error('Candidate is not bound to authorized source');
    if (target.profileId !== job.input.scan.profileId) throw new Error('Validation profile mismatch');
    const before = await scan(target.baselineUrl);
    const after = await scan(target.candidateUrl);
    if (!Array.isArray(before?.violations) || !Array.isArray(after?.violations)) throw new Error('Invalid scanner evidence');
    const beforeIds = new Set(before.violations.map(v=>v.id));
    const afterIds = new Set(after.violations.map(v=>v.id));
    const remainingViolationIds = [...beforeIds].filter(id=>afterIds.has(id));
    const newViolations = [...afterIds].filter(id=>!beforeIds.has(id));
    const outcome = afterIds.size === 0 ? 'passed' : 'failed';
    const evidenceArtifactId = await store.put({jobId:job.jobId,candidateDigest:job.candidate.digest,baseCommit:target.baseCommit,profileId:target.profileId,before,after});
    return {outcome,remainingViolationIds,newViolations,checks:[{profileId:target.profileId,status:outcome}],evidenceArtifactId};
  };
}
