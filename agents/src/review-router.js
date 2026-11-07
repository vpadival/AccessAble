import { timingSafeEqual } from 'node:crypto';
import { decide } from './workflow.js';
const matches = (value, expected) => {
 if (!value || !expected) return false;
 const a=Buffer.from(value), b=Buffer.from(expected);
 return a.length===b.length && timingSafeEqual(a,b);
};
/** Local trusted-host review surface. Agent publication is injected, never accepted as HTTP job state. */
export function reviewRouter({ Router, jobs, artifacts, reviewerToken, reviewerId }) {
 const router=Router();
 router.use((req,res,next)=> {
  if (!reviewerToken || !reviewerId) return res.status(503).json({error:'Human review is not configured'});
  if (!matches(req.headers.authorization,`Bearer ${reviewerToken}`)) return res.status(401).json({error:'Human reviewer authentication required'});
  next();
 });
 router.get('/',(req,res)=>res.json({jobs:[...jobs.values()].map(job=>({jobId:job.jobId,status:job.status,candidateDigest:job.candidate?.digest}))}));
 router.get('/:id',async(req,res)=>{
  const job=jobs.get(req.params.id);
  if (!job) return res.status(404).json({error:'Job not found'});
  try {
   const evidence=job.validation?.evidenceArtifactId ? await artifacts.get(job.validation.evidenceArtifactId) : null;
   if (evidence && evidence.candidateDigest!==job.candidate?.digest) throw Error('Evidence candidate mismatch');
   res.json({job,evidence});
  } catch(error) {res.status(409).json({error:error.message});}
 });
 router.post('/:id/decision',async(req,res)=>{
  const job=jobs.get(req.params.id);
  if (!job) return res.status(404).json({error:'Job not found'});
  try {
   const evidence=await artifacts.get(job.validation?.evidenceArtifactId);
   if (evidence.candidateDigest!==job.candidate?.digest) throw Error('Evidence candidate mismatch');
   const updated=decide(job,req.body,{kind:'human',id:reviewerId},[reviewerId]);
   const auditArtifactId=await artifacts.put(updated);
   jobs.set(job.jobId,updated);
   res.json({job:updated,auditArtifactId});
  } catch(error) {res.status(409).json({error:error.message});}
 });
 return router;
}
