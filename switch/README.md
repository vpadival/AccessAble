# Switch setup

Use Switch Console configuration; these Markdown files are briefs, not an executable Switch configuration format.

1. Start the local server in Console. Its bundled Mattermost requires Docker.
2. Confirm Codex is installed and signed in under Settings → Agent providers.
3. Create `accessable-repair` and `accessable-validation` under Your Agents. Select Codex and the authorized workspace. Paste the respective briefs from `agents/instructions/`.
4. Keep Bypass permissions off and Can manage agents off. Grant no unnecessary connectors. Verify sender rules allow the owner and the intended peer agent. Custom rules are needed for agents with different owners.
5. Create an `accessable-repairs` room under Your Rooms, select Mattermost, add both agents and paste `room-instructions.md`.
6. Explicitly mention each agent and request a read-only readiness reply with working directory and Git branch.
7. Submit a scan JSON and authorized source reference to the repair agent. Require a targeted candidate patch and an explicit handoff to `@accessable-validation`.
8. The validation agent must use the real scanner adapter and post evidence. The human reviews the exact digest; host code records identity from authenticated context.

No live room was created by this repository scaffold. No backend-to-Switch API is assumed. First prove manual room submission and handoff; choose and verify the installed release's documented transport before automating delivery.

## Judge runbook

- Record Console/server versions, Codex provider/model, Node version, base revision and scan profile.
- Run `npm --prefix agents test` and `npm --prefix agents run demo`.
- The demo produces a **synthetic** patch/handoff only. It is not evidence of an AI repair or accessibility scan.
- In the live room demonstrate both readiness replies, a real repair handoff, scanner before/after evidence, rejection and approval of a pinned candidate.
- Keep logs redacted and credentials outside Git. Preserve candidate/evidence hashes and the human decision reference.
- A missing scanner must be reported as blocked, not replaced with a fake passing result.

## Verified documentation

- https://docs.switchagents.ai/switch-rooms/getting-started/create-a-room
- https://docs.switchagents.ai/switch-rooms/getting-started/add-a-second-agent
- https://docs.switchagents.ai/switch-rooms/getting-started/agent-settings
- https://docs.switchagents.ai/switch-rooms/using/work-in-a-room
- https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/mattermost

Console 0.40.1 and local server 0.31.0 were observed during setup. Recheck installed behavior before automating configuration.
