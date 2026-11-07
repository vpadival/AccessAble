# Backend integration checkpoint

Imported backend/ from origin/feature/backend without modifying Member 1 source. Installed locked dependencies with npm ci --ignore-scripts.

Added agents/src/scanner-smoke.js: a controlled local HTTP fixture, real Member 1 Playwright/axe scanner, Member 1 toAgentJob transformer, Member 2 state machine. It asserts an unnamed button is found, then verifies the named-button fixture reaches awaiting_approval. Fixture repair is deterministic, not AI-generated, and is not delivered through Switch. It never applies to original source.

Run after browser installation:

```sh
node backend/node_modules/playwright/cli.js install chromium
node agents/src/scanner-smoke.js
```

Integration issues discovered:
- Backend scanner adapter falls back to a public demo for unknown workspaces; do not use for candidate approval.
- Adapter creates an evidence identifier but does not persist evidence or bind it to candidate digest.
- Backend creates jobs with a placeholder all-zero source revision.
- Frontend immediately requests results after asynchronous scan creation; polling is needed.
- Frontend silently falls back to mock results after live errors; acceptance mode must fail explicitly.
- No agent-job/status/approval API or verified backend-to-Switch transport is implemented yet.

These are required interface changes before claiming full integration. Existing source is imported as baseline so fixes can be reviewed separately.

Verified local smoke result: real Playwright/axe baseline returned `button-name`; corrected fixture returned zero violations; Member 2 workflow reached `awaiting_approval`, with `appliedToOriginal: false`. Browser installation and smoke both completed successfully. This confirms scanner/transformer/workflow interoperability, not live Switch delivery.
