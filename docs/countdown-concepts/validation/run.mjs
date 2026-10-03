import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = new URL('../../../', import.meta.url);
const concepts = ['tomorrows-roadworks', 'bubblegum-time', 'after-the-flame', 'low-tide-later', 'not-yet-ripe', 'still-drawing-tomorrow', 'held-in-suspense'];
const modules = [...concepts.map(id => `countdowns/concepts/${id}.scene.js`), ...['scene-host', 'scene-surfaces', 'scene-gallery'].map(id => `countdowns/${id}.js`)];
const hashes = async () => Object.fromEntries(await Promise.all(modules.map(async path => [path, createHash('sha256').update(await fs.readFile(new URL(path, root))).digest('hex')])));
const before = await hashes();
const result = {date: new Date().toISOString(), node: process.version, scope: 'offline saved-source/controller/lifecycle checks', gpuTested: false, modules: before, syntax: [], fixtures: [], limitations: ['DOM/canvas/fonts/rendering mocked', 'GLB image references removed for geometry-only parsing', 'no GPU shader compilation, texture decode, visual approval, browser-native link defaults, physical touch or device performance test']};
for (const path of modules) {
  const source = await fs.readFile(new URL(path, root), 'utf8');
  const run = spawnSync(process.execPath, ['--input-type=module', '--check'], {input: source, encoding: 'utf8'});
  result.syntax.push({path, passed: run.status === 0});
  if (run.status !== 0) process.stderr.write(run.stderr);
}
for (const fixture of ['controllers.mjs', 'shared-runtime.mjs', 'host-lifecycle.mjs']) {
  const run = spawnSync(process.execPath, [fileURLToPath(new URL(fixture, import.meta.url))], {encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  const record = run.stdout?.split('\n').find(line => line.startsWith('RESULTJSON '));
  result.fixtures.push({fixture, passed: run.status === 0, ...(record ? JSON.parse(record.slice(11)) : {}), ...(run.status !== 0 ? {error: run.stderr || run.error?.message || `exit ${run.status}`} : {})});
}
const after = await hashes();
result.sourceChangedDuringRun = modules.filter(path => before[path] !== after[path]);
result.passed = result.syntax.every(row => row.passed) && result.fixtures.every(row => row.passed) && !result.sourceChangedDuringRun.length;
await fs.writeFile(new URL('latest-results.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(`${result.passed ? 'PASS' : 'FAIL'}: ${result.syntax.filter(row => row.passed).length}/${modules.length} module parses; ${result.fixtures.filter(row => row.passed).length}/${result.fixtures.length} offline fixtures. See validation/latest-results.json.`);
if (!result.passed) process.exitCode = 1;
