// A single shared row is the entire backend. No accounts, sessions or visitor tracking.
const initialDeadline = Date.parse('2026-11-01T00:00:00-07:00');
function monthFromNow(now) {
  const date = new Date(now), day = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + 1);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.getTime();
}
function json(value, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export async function onRequest({ request, env }) {
  if (!['GET', 'POST'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
  if (!env.COUNTDOWN_DB) return json({ error: 'The shared countdown is taking a little break.' }, 503);
  if (request.method === 'POST') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Please press the button on the countdown page.' }, 403);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'JSON required.' }, 415);
  }
  try {
    const now = Date.now();
    const key = env.COUNTDOWN_KEY === 'live' ? 'live' : 'preview';
    // A single UPSERT makes deadline + count atomic, including the very first press.
    const row = request.method === 'POST'
      ? await env.COUNTDOWN_DB.prepare('INSERT INTO countdown (id, deadline, count) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET deadline = max(countdown.deadline, excluded.deadline), count = countdown.count + 1 RETURNING deadline, count').bind(key, monthFromNow(now)).first()
      : await env.COUNTDOWN_DB.prepare('SELECT deadline, count FROM countdown WHERE id = ?').bind(key).first();
    return json({ ...(row || { deadline: initialDeadline, count: 0 }), serverNow: now });
  } catch (error) {
    console.error('Countdown storage error:', error.message);
    return json({ error: 'The shared countdown is taking a little break.' }, 503);
  }
}
