# AccessAble Agent Workflow

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

## Integration status

The backend provides the Playwright/axe scanner and scan transformers. `src/scanner-smoke.js` verifies scanner-to-workflow interoperability with a controlled fixture; the fixture correction is deterministic rather than AI-generated.

`src/artifact-store.js` saves content-addressed JSON artifacts and checks integrity on reads. `src/evidence-adapter.js` binds before/after evidence to a candidate digest, source revision, and validation profile. Host code must supply authorized candidate URLs and keep artifact storage outside agent-writable workspaces.

`src/review-router.js` provides reviewer-authenticated job inspection and decisions when mounted by the backend. Job publication remains a trusted host operation. Live Switch handoff, candidate workspace provisioning, persistent job indexing, and room-to-review publication remain unfinished. Tests using adapter stubs do not establish live integration.
