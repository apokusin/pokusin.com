// No dependencies or site build: run with Node 22.13+.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';

const source = await readFile(new URL('../functions/api/countdown.js', import.meta.url), 'utf8');
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const db = new DatabaseSync(':memory:');
db.exec(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
assert.throws(() => db.prepare('INSERT INTO countdown (id, deadline) VALUES (NULL, 0)').run());
const binding = { prepare(sql) { return { bind(...args) { return {
  async first() { return db.prepare(sql).get(...args); },
  async run() { return db.prepare(sql).run(...args); }
}; } }; } };
const call = async (method = 'GET', key = 'preview', headers = {}, storage = binding) => {
  const tasks = [];
  const response = await onRequest({
    request: new Request('https://example.com/api/countdown', { method, headers: { ...(method === 'POST' ? { 'Content-Type': 'application/json', Origin: 'https://example.com' } : {}), ...headers } }),
    env: { COUNTDOWN_DB: storage, COUNTDOWN_KEY: key }, waitUntil(task) { tasks.push(task); }
  });
  await Promise.all(tasks);
  return response;
};
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

  // Exactly sixty accepted writes per IP/minute; rejected writes leave the count alone.
  const minuteStart = Date.parse('2030-06-15T12:34:00Z');
  Date.now = () => minuteStart + 12345;
  const client = { 'CF-Connecting-IP': '192.0.2.1' };
  const limitBefore = (await (await call()).json()).count;
  for (let i = 0; i < 60; i++) assert.equal((await call('POST', 'preview', client)).status, 200);
  const denied = await call('POST', 'preview', client);
  assert.equal(denied.status, 429);
  assert.equal(denied.headers.get('Retry-After'), '48');
  assert.equal((await denied.json()).retryAfter, 48);
  assert.equal((await (await call()).json()).count, limitBefore + 60);
  assert.equal((await call('POST', 'preview', { 'CF-Connecting-IP': '192.0.2.2' })).status, 200);
  assert.equal((await call('POST', 'live', client)).status, 200);
  Date.now = () => minuteStart + 60000;
  assert.equal((await call('POST', 'preview', client)).status, 200);
  const buckets = db.prepare('SELECT id FROM countdown_reset_limits').all();
  assert.ok(buckets.every(bucket => /^[a-f0-9]{64}$/.test(bucket.id)));

  // Trigger the opportunistic cleanup with a minute hash in its one-in-sixteen range.
  const minute = Math.floor(Date.now() / 60000);
  db.prepare('INSERT INTO countdown_reset_limits VALUES (?, ?, 1)').run('expired-test', minute - 3);
  let cleanupIp;
  for (let i = 0; !cleanupIp; i++) {
    const ip = `cleanup-${i}`;
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`preview:${minute}:${ip}`)));
    if (hash[0] < 16) cleanupIp = ip;
  }
  assert.equal((await call('POST', 'preview', { 'CF-Connecting-IP': cleanupIp })).status, 200);
  assert.equal(db.prepare('SELECT count(*) AS total FROM countdown_reset_limits WHERE minute < ?').get(minute - 2).total, 0);
  console.log('Shared countdown checks passed: dates, increments, environment isolation, request handling, spam boundary, minute rollover and cleanup.');
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

  // A fresh documentation-range address gives this local-only check its own bucket.
  // Cloudflare overwrites CF-Connecting-IP on public requests; this is only for Pages dev.
  const testIp = `2001:db8:${crypto.randomUUID().replaceAll('-', '').slice(0, 24).match(/.{4}/g).join(':')}`;
  let baseline = await get();
  if (baseline.serverNow % 60000 > 50000) {
    await new Promise(resolve => setTimeout(resolve, 60010 - baseline.serverNow % 60000));
    baseline = await get();
  }
  const burst = [];
  // Ten in flight exercises the race without exhausting the local preview's sockets.
  for (let batch = 0; batch < 8; batch++) burst.push(...await Promise.all(Array.from({ length: 10 }, async () => {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: url.origin, 'CF-Connecting-IP': testIp }, body: '{}' });
    return { status: response.status, retryAfter: response.headers.get('Retry-After'), body: await response.json() };
  })));
  const accepted = burst.filter(result => result.status === 200);
  const rejected = burst.filter(result => result.status === 429);
  assert.equal(accepted.length, 60);
  assert.equal(rejected.length, 20);
  assert.ok(rejected.every(result => Number(result.retryAfter) > 0 && result.body.retryAfter === Number(result.retryAfter)));
  assert.deepEqual(accepted.map(result => result.body.count).sort((a, b) => a - b), Array.from({ length: 60 }, (_, i) => baseline.count + i + 1));
  assert.equal((await get()).count, baseline.count + 60);
  console.log('Local Pages/D1 limiter passed: eighty requests, ten at a time, accepted exactly sixty and rejected twenty without lost increments.');
}
