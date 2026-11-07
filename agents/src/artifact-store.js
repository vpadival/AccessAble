import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

// Host-owned storage: do not expose its directory as an agent-writable workspace.
export class ArtifactStore {
  constructor(directory) { this.directory = resolve(directory); }
  async put(value) {
    const bytes = JSON.stringify(value);
    const digest = createHash('sha256').update(bytes).digest('hex');
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    try { await writeFile(join(this.directory, digest + '.json'), bytes, { flag: 'wx', mode: 0o600 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; await this.get(digest); }
    return digest;
  }
  async get(digest) {
    if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error('Invalid artifact digest');
    const bytes = await readFile(join(this.directory, digest + '.json'), 'utf8');
    if (createHash('sha256').update(bytes).digest('hex') !== digest) throw new Error('Artifact integrity check failed');
    return JSON.parse(bytes);
  }
}
