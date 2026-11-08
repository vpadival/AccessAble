import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTargetUrl} from '../src/target-url.js';
test('normalizes website URLs and rejects non-web schemes',()=>{
 assert.equal(normalizeTargetUrl(' example.com/path '),'https://example.com/path');
 assert.equal(normalizeTargetUrl('https://example.com'),'https://example.com/');
 for(const value of ['file:///etc/passwd','javascript:alert(1)','https://name:secret@example.com',''])assert.throws(()=>normalizeTargetUrl(value));
});
