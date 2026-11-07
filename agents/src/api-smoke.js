import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { configureApi, requestScan, waitForScan, getScanResults, getReport, getFixComparison } from '../../frontend/src/services/api.js';
const fixture = createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="en"><title>API fixture</title><main><h1>Test</h1><button></button></main></html>');});
await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
try {
 configureApi({baseUrl:'http://127.0.0.1:4000/api/v1',useMockData:false});
 const scan = await requestScan({targetUrl:`http://127.0.0.1:${fixture.address().port}/`});
 assert.equal(scan.isMock,false);
 await waitForScan(scan.scanId);
 const result = await getScanResults(scan.scanId);
 assert.equal(result.isMock,false);
 assert(result.violations.length>0);
 assert.equal((await getReport(scan.scanId)).isMock,false);
 assert.equal((await getFixComparison(scan.scanId)).isMock,false);
 await assert.rejects(getScanResults('missing-scan'));
 console.log(JSON.stringify({scanId:scan.scanId,violations:result.violations.length,isMock:result.isMock,report:'passed',comparison:'passed',missingScan:'rejects without mock fallback'},null,2));
} finally { fixture.close(); }
