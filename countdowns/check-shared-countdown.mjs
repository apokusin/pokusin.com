// No dependencies or site build: run with Node 22+.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';

const source = await readFile(new URL('../functions/api/countdown.js', import.meta.url), 'utf8');
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const db = new DatabaseSync(':memory:');
db.exec(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
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
  const responses = await Promise.all(Array.from({ length: 20 }, () => call('POST')));
  const counts = await Promise.all(responses.map(async response => (await response.json()).count));
  assert.equal(new Set(counts).size, 20);
  assert.equal((await (await call()).json()).count, before + 20);
  assert.equal((await (await call('GET', 'live')).json()).count, 0);
  assert.equal((await (await call('POST', 'live')).json()).count, 1);
  assert.equal((await (await call()).json()).count, before + 20);
  console.log('Shared countdown checks passed: dates, concurrent tally, environment isolation, request handling.');
} finally { Date.now = realNow; db.close(); }
