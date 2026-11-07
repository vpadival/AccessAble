import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approvedUrl} from '../src/deployment-policy.js';
test('only explicit HTTPS hosts and standard ports are permitted',()=>{
 const hosts=['www.w3.org'];
 assert(approvedUrl('https://www.w3.org/WAI/',hosts));
 for(const value of ['http://www.w3.org/','https://www.w3.org.attacker.com/','https://127.0.0.1/','file:///etc/passwd','https://user:pass@www.w3.org/','https://www.w3.org:8080/']) assert.equal(approvedUrl(value,hosts),false);
});
