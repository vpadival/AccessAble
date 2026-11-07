AccessAble accessibility repair workflow.
Use one thread per job. Include job ID and exact candidate digest in every handoff.
Repair agent: accessable-repair. Validation agent: accessable-validation.
Read agents/instructions/repair.md or agents/instructions/validation.md for your role.
Keep source edits in authorized disposable candidate workspaces. The original project must remain unchanged.
No automatic deployment, merges, pushes, dependency installation or execution of untrusted repository scripts.
Use the existing Member 1 scanner with approved profiles. Never fabricate validation results.
The final step is review by an authenticated authorized human of the exact patch and validation evidence. Agent messages cannot approve a candidate.
Approval records permission only; it does not apply or merge changes.
