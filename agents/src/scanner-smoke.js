// Trusted local fixture only. Reuses Member 1 scanner; no repository code execution.
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { runScan } from '../../backend/src/scanner.js';
import { toAgentJob } from '../../backend/src/transformers/toAgentFormat.js';
import { createJob, beginRepair, propose, validate } from './workflow.js';
let fixed = false;
const server = createServer((req,res) => {
 res.setHeader('Content-Type','text/html');
 res.end(`<!doctype html><html lang="en"><head><title>Scanner fixture</title></head><body><main><h1>Search</h1><button id="search">${fixed ? 'Search' : ''}</button></main></body></html>`);
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
try {
 const url = `http://127.0.0.1:${server.address().port}/`;
 const before = await runScan(url);
 assert(before.violations.some(v => v.id === 'button-name'));
 const input = toAgentJob(before,{jobId:'scanner-smoke',workspaceId:'local-fixture',baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()});
 const candidate = propose(beginRepair(createJob(input)),{patch:'--- a/fixture.html\n+++ b/fixture.html\n@@ -1 +1 @@\n-<button id="search"></button>\n+<button id="search">Search</button>\n',changedFiles:['fixture.html']});
 fixed = true;
 const after = await runScan(url);
 const ids = new Set(after.violations.map(v=>v.id));
 const baseline = new Set(before.violations.map(v=>v.id));
 const report = {outcome:ids.size===0?'passed':'failed',remainingViolationIds:[...baseline].filter(id=>ids.has(id)),newViolations:[...ids].filter(id=>!baseline.has(id)),checks:[{profileId:'local-fixture',status:ids.size===0?'passed':'failed'}],evidenceArtifactId:'stdout-scanner-smoke'};
 const result = await validate(candidate,async()=>report);
 assert.equal(result.status,'awaiting_approval');
 assert.equal(result.appliedToOriginal,false);
 console.log(JSON.stringify({kind:'real-scanner-controlled-fixture',aiGenerated:false,switchDelivered:false,before:before.violations.map(v=>v.id),after:after.violations.map(v=>v.id),status:result.status,candidateDigest:result.candidate.digest},null,2));
} finally {server.close();}
