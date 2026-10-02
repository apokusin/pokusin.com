// No dependencies or site build: run with Node 22.13+.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';

const source = await readFile(new URL('../functions/api/countdown.js', import.meta.url), 'utf8');
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const db = new DatabaseSync(':memory:');
db.exec(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
assert.throws(() => db.prepare('INSERT INTO countdown (id, deadline) VALUES (NULL, 0)').run());
const binding = { prepare(sql) { return { bind(...args) { return { async first() { return db.prepare(sql).get(...args); } }; } }; } };
const call = (method = 'GET', key = 'preview', headers = {}, storage = binding) => onRequest({
  request: new Request('https://example.com/api/countdown', { method, headers: { ...(method === 'POST' ? { 'Content-Type': 'application/json', Origin: 'https://example.com' } : {}), ...headers } }),
  env: { COUNTDOWN_DB: storage, COUNTDOWN_KEY: key }
});
const realNow = Date.now;
try {
  assert.equal((await (await call()).json()).count, 0);
  assert.equal((await call('DELETE')).status, 405);
  assert.equal((await call('POST', 'preview', { Origin: 'https://elsewhere.com' })).status, 403);
  assert.equal((await call('POST', 'preview', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await call('GET', 'preview', {}, null)).status, 503);
  assert.equal((await call()).headers.get('Cache-Control'), 'no-store');

  // End-of-month and leap-year behavior, preserving the exact time of day.
  for (const [now, expected] of [
    ['2027-01-31T12:34:56Z', '2027-02-28T12:34:56Z'],
    ['2028-01-31T12:34:56Z', '2028-02-29T12:34:56Z'],
    ['2028-12-31T12:34:56Z', '2029-01-31T12:34:56Z']
  ]) {
    Date.now = () => Date.parse(now);
    assert.equal((await (await call('POST')).json()).deadline, Date.parse(expected));
  }
  Date.now = realNow;
  const before = (await (await call()).json()).count;
  const counts = [];
  for (let i = 0; i < 20; i++) counts.push((await (await call('POST')).json()).count);
  assert.equal(new Set(counts).size, 20);
  assert.equal((await (await call()).json()).count, before + 20);
  assert.equal((await (await call('GET', 'live')).json()).count, 0);
  assert.equal((await (await call('POST', 'live')).json()).count, 1);
  assert.equal((await (await call()).json()).count, before + 20);
  console.log('Shared countdown checks passed: dates, atomic increments, environment isolation, request handling.');
} finally { Date.now = realNow; db.close(); }

// Optional real Pages/D1 integration: pass a local preview URL as the first argument.
// Unlike the synchronous SQLite adapter above, these HTTP requests overlap.
if (process.argv[2]) {
  const url = new URL('/api/countdown', process.argv[2]);
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname), 'Use the local preview, not the public countdown.');
  const get = async () => {
    const response = await fetch(url, { cache: 'no-store' });
    assert.equal(response.status, 200);
    return response.json();
  };
  const before = await get();
  const results = await Promise.all(Array.from({ length: 8 }, async () => {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: url.origin }, body: '{}' });
    assert.equal(response.status, 200);
    return response.json();
  }));
  assert.deepEqual(results.map(result => result.count).sort((a, b) => a - b), Array.from({ length: 8 }, (_, i) => before.count + i + 1));
  assert.equal((await get()).count, before.count + 8);
  console.log('Local Pages/D1 integration passed: eight simultaneous HTTP presses counted without loss.');
}
