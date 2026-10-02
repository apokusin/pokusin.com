// One shared countdown row. Short-lived spam buckets need no accounts or sessions.
const initialDeadline = Date.parse('2026-11-01T00:00:00-07:00');
const resetLimit = 60;
function monthFromNow(now) {
  const date = new Date(now), day = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + 1);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.getTime();
}
function json(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}
async function acceptReset(context, key, now) {
  const minute = Math.floor(now / 60000);
  // Cloudflare supplies this header. The minute makes the hash a temporary bucket,
  // rather than an identifier that follows a visitor between visits.
  const ip = context.request.headers.get('CF-Connecting-IP') || 'local';
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${key}:${minute}:${ip}`)));
  const id = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
  const bucket = await context.env.COUNTDOWN_DB.prepare('INSERT INTO countdown_reset_limits (id, minute, count) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET count = count + 1 WHERE count < ? RETURNING count').bind(id, minute, resetLimit).first();
  // Roughly one in sixteen new buckets cleans up expired buckets off the response
  // path. The minute index avoids scanning current visitors or the countdown.
  if (bucket?.count === 1 && digest[0] < 16) {
    context.waitUntil(context.env.COUNTDOWN_DB.prepare('DELETE FROM countdown_reset_limits WHERE minute < ?').bind(minute - 2).run().catch(error => console.error('Countdown cleanup error:', error.message)));
  }
  return Boolean(bucket);
}
export async function onRequest(context) {
  const { request, env } = context;
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
    if (request.method === 'POST' && !await acceptReset(context, key, now)) {
      const retryAfter = Math.max(1, Math.ceil((60000 - now % 60000) / 1000));
      return json({ error: 'Give the button a breather.', retryAfter }, 429, { 'Retry-After': String(retryAfter) });
    }
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
