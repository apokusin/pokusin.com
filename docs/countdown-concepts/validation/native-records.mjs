import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// Read the generated archive rather than maintaining a second roster of works.
const html = await fs.readFile(new URL('../../../countdowns/index.html', import.meta.url), 'utf8');
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attribute = (tag, name) => decode(tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] || '');
export const records = [...html.matchAll(/(<a class="card"[^>]*>)([\s\S]*?)<\/a>/g)].map(([, tag, body]) => {
  const href = attribute(tag, 'href');
  return { href, thumbnail: attribute(tag, 'data-thumb'), show: href.split('/')[2],
    label: decode(body.match(/<div class="label">([^<]*)<\/div>/)?.[1] || ''),
    target: attribute(tag, 'target'), rel: attribute(tag, 'rel'), live: /class="chip">Live/.test(body) };
});
assert.equal(records.length, 13, 'generated archive has thirteen actual displayed versions');
assert.equal(new Set(records.map(record => record.href)).size, 13);
assert(records.every(record => record.thumbnail && record.label && record.target === '_blank'));
export const archiveDestinations = [...html.matchAll(/<a class="more shelf-more" href="([^"]*)"/g)].map(([, href]) => ({ href: decode(href), show: href.split('/')[2] }));
assert.equal(archiveDestinations.length, 5);
export const timeline = decode(html.match(/class="scene-timeline-link"[^>]*href="([^"]*)"/)?.[1] || '');
assert.equal(timeline, '/countdowns/dexter/s7-episodes/');
