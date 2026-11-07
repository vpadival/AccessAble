import {test} from 'node:test';
import assert from 'node:assert/strict';
import {navigateForScan} from '../src/navigation.js';
const page = goto => ({goto,locator:()=>({waitFor:async()=>{}})});
test('HTTP2 failure retries once then reports no result',async()=>{
 let calls=0;
 await assert.rejects(navigateForScan(page(async()=>{calls++;throw Error('net::ERR_HTTP2_PROTOCOL_ERROR');}),'https://example.com'),/no accessibility result/);
 assert.equal(calls,2);
});
test('HTTP2 transient failure recovers with DOM readiness',async()=>{
 let calls=0;
 await navigateForScan(page(async(url,opts)=>{assert.equal(opts.waitUntil,'domcontentloaded');if(++calls===1)throw Error('net::ERR_HTTP2_PROTOCOL_ERROR');return {status:()=>200};}),'https://example.com');
 assert.equal(calls,2);
});
test('HTTP errors are not scanned or retried',async()=>{
 let calls=0;
 await assert.rejects(navigateForScan(page(async()=>{calls++;return {status:()=>403};}),'https://example.com'),/HTTP 403/);
 assert.equal(calls,1);
});
