# Foundation validation checklist

## Local automated checks

From repository root:

```sh
npm --prefix agents test
npm --prefix agents run demo
git diff --check
```

Expected: eight tests pass. Demo emits `status: validating`, a SHA-256 candidate digest and `nextAgent: accessable-validation`. It explicitly says synthetic. No files are repaired, no scanner runs and no approval is fabricated.

Tests cover unauthorized/agent reviewers, human rejection, stale patches, changed evidence, bounded retries, scanner exceptions, regressions, malformed inputs and symlink escape.

## Live Switch handoff (manual acceptance)

1. In Console create `accessable-validation` using Codex and this repo as working directory. Paste `agents/instructions/validation.md`. Use `agents/instructions/repair.md` for `accessable-repair`.
2. Add both agents to the same Mattermost room. Paste `switch/room-instructions.md` into room instructions. Permit the intended peer agent to address the other; keep Bypass permissions off.
3. Send: `@accessable-repair readiness check only: report cwd, branch, and whether you can see agents/src/workflow.js. Do not edit files or run repository scripts.`
4. Send: `@accessable-validation readiness check only: report cwd and branch. Do not edit files or run repository scripts.`
5. Send: `@accessable-repair handoff connectivity test only. Ask @accessable-validation to acknowledge job connectivity-001. No repairs, scanner execution, or approval. Ask it to report that real scanner validation is pending.`
6. Pass only if the Validation Agent independently replies in the room with the correlated job ID. A repair-agent message claiming delivery is not sufficient.
7. Preserve the thread URL/message references as evidence. Do not label this connectivity test as actual accessibility validation.

Expected branch: `feature/ai-switch-integration`. If an existing session still reports `main`, stop that session and start a new one.

## Real integration acceptance (pending backend)

Member 1 must provide the actual scanner function/service contract, trusted command profiles, source revision and isolated candidate serving mechanism. Connect that function as the `validate()` adapter, capture equivalent before/after scans and regression evidence, then request human review of the exact digest. Missing scanner evidence must fail or block.

No automatic patch application, merging or deployment is part of this foundation.
