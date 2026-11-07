# Member 2 workflow foundation

Dependency-free Node 22 ES module. Run `npm --prefix agents test` and `npm --prefix agents run demo` from the repository root.

## Current scope

`src/workflow.js` exports contract checks, bounded repair transitions, proposal hashing, a host-injected scanner adapter, validation-to-review transitions, authenticated human decision checks, and structured handoffs. It never executes patches, starts target projects, applies changes, merges or deploys. Switch briefs and setup are in `../switch/`.

This is a library scaffold, not a secured multiuser service or complete end-to-end integration. Callers must persist immutable jobs/artifacts, authenticate principals, enforce concurrency/idempotency and prevent agents from modifying host state. JSON input must never supply the trusted principal or reviewer allowlist. Workspace checking resolves existing paths and symlinks; it is not an OS sandbox and does not eliminate filesystem races. Use an isolated environment for actual candidate execution.

## Backend interface

Input example: `fixtures/scan.example.json`. `workspaceId` and `scan.profileId` must resolve through trusted host configuration. Preserve axe violation objects and nested target arrays. Supply a real full base revision for each job.

Host flow: `createJob(input)` → `beginRepair(job)` → `propose(job, {patch, changedFiles})` → Switch handoff → `validate(job, scannerAdapter)` → `decide(job, decision, authenticatedPrincipal, reviewerIds)`.

Scanner adapter is an async function receiving a copy of the job. It must return:

```json
{
  "outcome": "passed",
  "remainingViolationIds": [],
  "newViolations": [],
  "checks": [{"profileId": "approved-profile", "status": "passed"}],
  "evidenceArtifactId": "immutable-before-after-evidence"
}
```

The host must ensure evidence corresponds to the exact candidate, run equivalent baseline/candidate scans, and reject unsupported profiles. The workflow deliberately supplies no shell runner. `passed` requires no remaining or new violations and all checks passing. Scanner exceptions produce `failed`.

Approval decision: `{decision: 'approved' | 'rejected', candidateDigest: '<digest>'}`. Principal: `{kind: 'human', id: '<authenticated-id>'}` supplied exclusively by trusted host/session context. Result remains `appliedToOriginal: false`.

## Integration still required

Member 1 must supply scanner invocation, structured sample output, trusted validation profiles and candidate serving mechanism. No backend/frontend files were changed. Persisted job storage and authenticated room decision ingestion remain to be implemented after agreeing that interface. Live Codex repair/validation handoff and browser evidence remain to be demonstrated in Switch; unit-test adapter stubs are not scanner evidence.
