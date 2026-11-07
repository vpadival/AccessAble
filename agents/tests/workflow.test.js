import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createJob, beginRepair, propose, validate, decide, authorizedPath } from '../src/workflow.js';
const input = { schemaVersion: '1.0', jobId: 'test', project: { workspaceId: 'demo', baseCommit: 'a'.repeat(40) }, scan: { profileId: 'demo', violations: [] } };
const candidate = () => propose(beginRepair(createJob(input)), { patch: 'example diff', changedFiles: ['src/demo.html'] });
const report = { outcome: 'passed', remainingViolationIds: [], newViolations: [], checks: [{ status: 'passed' }], evidenceArtifactId: 'evidence-1' };
const reviewer = { kind: 'human', id: 'owner' };
test('requires independent validation and authenticated human approval', async () => {
 const job = await validate(candidate(), async () => report);
 assert.equal(job.status, 'awaiting_approval');
 const decision = { decision: 'approved', candidateDigest: job.candidate.digest };
 assert.throws(() => decide(job, decision, {kind:'agent',id:'owner'}, ['owner']));
 assert.throws(() => decide(job, decision, {kind:'human',id:'other'}, ['owner']));
 assert.equal(decide(job, decision, reviewer, ['owner']).appliedToOriginal, false);
 job.candidate.patch += 'tampered';
 assert.throws(() => decide(job, decision, reviewer, ['owner']));
});
test('scanner failure never passes, regressions require revision', async () => {
 assert.equal((await validate(candidate(), async () => {throw Error('timeout');})).status, 'failed');
 assert.equal((await validate(candidate(), async () => ({...report,newViolations:['contrast']}))).status, 'needs_revision');
});
test('rejects invalid contracts and traversal', () => {
 assert.throws(() => createJob({...input,jobId:'../escape'}));
 assert.throws(() => propose(beginRepair(createJob(input)),{patch:'x',changedFiles:['../secret']}));
});
test('rejects symlinks outside workspace', async () => {
 const base = await mkdtemp(join(tmpdir(),'accessable-'));
 try { await mkdir(join(base,'root')); await mkdir(join(base,'outside')); await symlink(join(base,'outside'),join(base,'root','escape')); await assert.rejects(authorizedPath(join(base,'root'),join(base,'root','escape'))); }
 finally { await rm(base,{recursive:true,force:true}); }
});
test('human rejection is final and cannot be approved again', async () => {
 const job = await validate(candidate(), async () => report);
 const rejected = decide(job, {decision:'rejected',candidateDigest:job.candidate.digest}, reviewer, ['owner']);
 assert.equal(rejected.status,'rejected');
 assert.throws(() => decide(rejected,{decision:'approved',candidateDigest:job.candidate.digest},reviewer,['owner']));
});
test('modified evidence and stale digest cannot be approved', async () => {
 const job = await validate(candidate(), async () => report);
 assert.throws(() => decide(job,{decision:'approved',candidateDigest:'stale'},reviewer,['owner']));
 job.validation.checks[0].status='failed';
 assert.throws(() => decide(job,{decision:'approved',candidateDigest:job.candidate.digest},reviewer,['owner']));
});
test('repair attempts are bounded and reset previous review data', async () => {
 let job = await validate(candidate(), async () => ({...report,outcome:'failed'}));
 job = beginRepair(job);
 assert.equal(job.attempts,2);
 assert.equal(job.validation,null);
 job = propose(job,{patch:'second proposal',changedFiles:['src/demo.html']});
 job = await validate(job,async () => ({...report,outcome:'failed'}));
 assert.throws(() => beginRepair(job),/limit/);
});
test('missing evidence and failed checks cannot pass validation', async () => {
 assert.equal((await validate(candidate(),async () => ({...report,evidenceArtifactId:null}))).status,'failed');
 assert.equal((await validate(candidate(),async () => ({...report,checks:[{status:'failed'}]}))).status,'needs_revision');
});
