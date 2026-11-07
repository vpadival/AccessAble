import React, {useState} from 'react';
import {API_CONFIG} from '../services/api.js';
export default function AgentReview() {
 const [token,setToken]=useState(''); const [jobs,setJobs]=useState([]); const [selected,setSelected]=useState(null); const [error,setError]=useState('');
 async function request(path='',body) {
  const response=await fetch(`${API_CONFIG.baseUrl}/agent-jobs${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const result=await response.json(); if(!response.ok)throw Error(result.error || 'Review request failed');return result;
 }
 async function perform(action){setError('');try{await action();}catch(e){setError(e.message);}}
 return <section className="p-6 border rounded m-6" aria-label="Human candidate review">
  <h2>Human candidate review</h2><p>Review the exact patch and scanner evidence. Approval records permission; it does not apply changes.</p>
  <label>Reviewer token <input type="password" autoComplete="off" value={token} onChange={e=>{setToken(e.target.value);setSelected(null);setJobs([]);}} /></label>
  <button onClick={()=>perform(async()=>setJobs((await request()).jobs))}>Load review jobs</button>
  {error && <p role="alert">{error}</p>}
  {jobs.map(job=><button key={job.jobId} onClick={()=>perform(async()=>setSelected(await request('/'+encodeURIComponent(job.jobId))))}>{job.jobId}: {job.status}</button>)}
  {selected && <div><h3>{selected.job.jobId}: {selected.job.status}</h3><pre className="overflow-auto">{selected.job.candidate?.patch}</pre><pre className="overflow-auto">{JSON.stringify(selected.evidence,null,2)}</pre>
   {['approved','rejected'].map(decision=><button key={decision} disabled={selected.job.status!=='awaiting_approval'} onClick={()=>perform(async()=>{await request('/'+encodeURIComponent(selected.job.jobId)+'/decision',{decision,candidateDigest:selected.job.candidate.digest});setSelected(await request('/'+encodeURIComponent(selected.job.jobId)));})}>{decision==='approved'?'Approve candidate':'Reject candidate'}</button>)}
  </div>}
 </section>;
}
