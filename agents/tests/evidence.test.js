import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {ArtifactStore} from '../src/artifact-store.js';
import {evidenceAdapter} from '../src/evidence-adapter.js';
test('evidence is persisted, digest bound and tampering detected',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'accessable-evidence-'));
 try {
  const store=new ArtifactStore(dir);
  const job={jobId:'job',input:{project:{workspaceId:'demo'},scan:{profileId:'profile'}},candidate:{digest:'candidate',baseCommit:'base'}};
  const resolveCandidate=async()=>({candidateDigest:'candidate',baseCommit:'base',profileId:'profile',baselineUrl:'before',candidateUrl:'after'});
  const adapter=evidenceAdapter({store,resolveCandidate,scan:async url=>({violations:url==='before'?[{id:'button-name'}]:[]})});
  const report=await adapter(job);
  assert.equal(report.outcome,'passed');
  assert.equal((await store.get(report.evidenceArtifactId)).candidateDigest,'candidate');
  await writeFile(join(dir,report.evidenceArtifactId+'.json'),'{}');
  await assert.rejects(store.get(report.evidenceArtifactId),/integrity/);
  await assert.rejects(store.get('../escape'));
  job.candidate.digest='changed';
  await assert.rejects(adapter(job),/bound/);
 } finally {await rm(dir,{recursive:true,force:true});}
});
