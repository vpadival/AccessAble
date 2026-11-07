import { readFile } from 'node:fs/promises';
import { createJob, beginRepair, propose, handoff } from './workflow.js';
const input = JSON.parse(await readFile(new URL('../fixtures/scan.example.json', import.meta.url)));
const job = propose(beginRepair(createJob(input)), {
  patch: '--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-<button id="search"></button>\n+<button id="search">Search</button>\n',
  changedFiles: ['index.html']
});
console.log(JSON.stringify({ notice: 'Synthetic proposal only: no AI repair, scanner execution or Switch delivery performed.', handoff: handoff(job), job }, null, 2));
