# Frontend baseline

Imported origin/feature/frontend commit 68ea81e7ffd24e70fef1f8cd7a0d5ff4953c030c into frontend/ on the integration branch; original branch untouched.

Changed esbuild from ^0.25.0 to ^0.28.0 to satisfy Vite 8 peer requirements. Generated package-lock.json using npm; existing bun.lock is retained from upstream but does not reflect this dependency change. Use npm for this checkpoint.

Verified: npm install --ignore-scripts, npm run build, npm run lint, and all eight agents tests pass. Build reports a large bundle warning. Local Vite server starts on 127.0.0.1:3000. Browser interaction/visual QA was unavailable in the agent session and remains pending.

The frontend defaults to demonstration mocks. src/services/api.js also falls back to mocks on live HTTP failures. A rendered successful scan is therefore not proof of a real scan or Switch connection.

Required integration interface: backend must accept source-authorized repair jobs, return job status/candidate digest/validation evidence, and record authenticated human decisions. Frontend should read that status and submit approval/rejection for a specific digest; UI simulation of applied fixes cannot be interpreted as approval or application. Exact endpoints must be agreed with Member 1; no endpoints or Switch API were invented here.

Repeat after real integration: disable mocks and fallback behavior for acceptance testing; submit a real scanner result, observe Switch repair-to-validation handoff, compare pinned before/after evidence, and verify both rejection and human approval without applying to the original project. Backend branch is not visible on origin as of this checkpoint.
