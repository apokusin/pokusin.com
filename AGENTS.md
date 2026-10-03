# AGENTS.md — pokusin.com

A hand-written personal site. There is **no site build step and no `package.json`** — files are served verbatim. Deployed on **Cloudflare Pages**, project `pokusin-com`, from the `master` branch (pushes auto-deploy to pokusin.com). Only `/api/countdown` uses a Pages Function and D1; all pages and archive files remain static. The countdown themes are being explored in PR #12 on `codex/next-countdown`.

## Files
- `index.html`, `styles.css` — the home "link-in-bio" page.
- `countdowns/` — an archive of past TV-show countdown sites (the bulk of this repo).
- `countdowns/generate.py` — the generator (single source of truth for the archive UI).
- `.gitignore` ignores `node_modules/`, `.DS_Store`, `.playwright-mcp/`.

## Local preview
```
python3 -m http.server 8000 --bind 127.0.0.1   # → http://127.0.0.1:8000/  and  /countdowns/
```
Bind to `127.0.0.1` only, and kill the server when finished.

For the shared countdown API, use Wrangler's local D1 instead:
```
wrangler d1 execute pokusin-countdown --local --file countdowns/schema.sql
wrangler pages dev . --ip 127.0.0.1 --port 8000
```
The Python server previews the layout but cannot run the shared reset API.

## Shared countdown and themes

- `?theme=control` (default) is a dark broadcast wall; `?theme=royal` is a paper theatre with uneven picture mounts. Royal reads forward through the archive, while control starts with the newest work. Show navigation preserves the selected theme.
- The public gallery has no theme selector. Control is the direction being refined; earlier concepts remain reachable through their explicit query URLs as references.
- Edit gallery markup/CSS in `generate.py`; edit the shared timer and Three.js scenes in `countdowns/themes.js`. Control's pooled blast lives in `control-explosion.js`; `control-transformation.js` owns the clock parts' staged reconstruction. The generator fingerprints these helpers with the theme module.
- Eight additional art explorations are selectable through **Worlds**: `tomorrows-roadworks`, `bubblegum-time`, `after-the-flame`, `low-tide-later`, `not-yet-ripe`, `still-drawing-tomorrow`, `held-in-suspense`, and `the-almost-fair`. Their separate modules/styles live in `countdowns/concepts/`; `exhibition.js` owns shared scene lifecycle, DOM projection and preview adapters. Read `docs/countdown-concepts/GUIDE.md`, the concept spec/report/reference, and `countdowns/concepts/CONTRACT.md` before changing one. No final direction has been selected.
- Art themes show faithful stills from `assets/previews/` in closed exhibits; opening always loads the real preserved page. The Fair is a full-viewport world: its physical plan offers direct travel, cabinet latches open collapsed versions, and the Worlds constellation switches themes. Native controls/links remain as an accessible semantic twin; keyboard focus steers the scene. Helpers `fair-materials.js`, `fair-architecture.js` and `fair-machinery.js` own physical materials, construction and real drum/tally textures. The live iframe occupies the approached screen aperture; graphics loss restores the illustrated DOM archive. Keep viewport-aligned preview origins, focus restoration, graphics failure fallbacks, and cancellation of touch input.
- Material libraries `engineered-materials.js`, `liquid-materials.js` and `drawing-surfaces.js` own the concrete/chrome, wax/chalk and paper/rubber/wood recipes. The seven non-Fair revisions have concrete texture/light/shadow and interaction specs with browser comparison evidence. Import helpers with the generated art version; keep microscopic detail distinct from authored macro relief and never bake live UI into art.
- `countdowns/reels.js` supplies digit reels for both clocks and the press tally. Regular ticks roll only changed digits; resets spin and settle from left to right. Preserve immediate values for reduced motion and screen readers.
- `functions/api/countdown.js` reads or atomically resets one D1 row: deadline plus total presses. Each press moves the deadline one calendar month ahead in UTC, clamped at month end.
- A small D1 spam guard accepts up to 60 resets per IP per minute. Its keys use a server-secret HMAC of the IP, minute and environment; raw IPs and persistent visitor identifiers are not stored. Set `COUNTDOWN_RATE_LIMIT_SECRET` as a Cloudflare Pages secret for production and preview, and in ignored `.dev.vars` for local development. The key is never served or committed. Excess requests return 429 with `Retry-After`. Old indexed buckets are cleaned opportunistically in the background.
- `wrangler.toml` supplies the `COUNTDOWN_DB` binding and `COUNTDOWN_KEY`: `live` for production, `preview` otherwise. Preview presses never alter the live row. Local development uses local storage.
- `_routes.json` runs the Function only for `/api/countdown`. Keep the rest of the site static.
- Initialize the remote schema once with `wrangler d1 execute pokusin-countdown --remote --file countdowns/schema.sql`. It is idempotent.
- Run `node countdowns/check-shared-countdown.mjs` with Node 22.13+ for the small backend checks. No dependencies are needed.
- With the local Pages preview running, add `http://127.0.0.1:8000` to that check command to verify eight simultaneous HTTP presses against local D1, then a limiter burst of 80 requests with ten in flight at a time.
- Three.js 0.180.0 is vendored under `countdowns/assets/vendor/` with its license. Both scenes have illustrated fallbacks and respect reduced motion.
- A successful local Control press triggers a 5.8-second full-viewport blast and mechanical reconstruction. Base, hinged shell, glass and fasteners arrive in stages; fresh digits light at 4.5 seconds. The red button survives. Remote updates never trigger the spectacle. Reduced motion settles immediately; offscreen, hidden, resize and graphics-loss cancellation restore the clock and native controls. The accessible timer always uses the real shared deadline. Royal retains its title drift.
- Run `node tests/check-control-effects.mjs` for deterministic desktop/phone motion, exact source-pose restoration and repeat-safe GPU resource cleanup. These offline checks do not validate shader appearance or physical-device performance; review the actual sequence in a browser.

## The /countdowns archive

An archival gallery of the TV-show countdown sites Artur built between 2012 and 2025, each
preserved as a self-contained static site under `countdowns/<show>/<version>/` and re-pointed
so its timer ticks live again. The gallery page, the per-show archive pages, the sticky
show-nav, the Dexter Season 7 timeline scrubber, and `countdowns.css` are all **generated**.

### Making changes
Edit the data/templates at the top of `countdowns/generate.py`, then run it:
```
python3 countdowns/generate.py
```
It reads the `SHOWS` / `EPISODES` data and writes `countdowns/index.html`,
`countdowns/<show>/index.html`, `countdowns/dexter/s7-episodes/index.html`, and
`countdowns/countdowns.css`.

### Rules

1. **Generated output is never hand-edited.** Change labels, order, copy, collapse state,
   zoom, the nav, or layout in `generate.py` and regenerate. Editing the generated
   `index.html`/`countdowns.css` directly is overwritten on the next run.

2. **Archived versions are faithful — sanitize, don't redesign.** Each
   `countdowns/<show>/<version>/` is the original site preserved. Allowed edits only: strip
   dead third-party loaders (Facebook / Twitter / Woopra / Google Analytics / Hammer `ws://`
   live-reload), vendor blocked `http://` CDN scripts locally (e.g. jQuery), upgrade surviving
   `http://` to `https://`, and re-point the countdown target. Use **relative asset paths
   only** (`assets/…`, `./…`); root-absolute (`/…`) breaks under the subpath. Never commit
   `cert.pem`/`key.pem`/`*.sublime-*`/`*.psd`/`.DS_Store`.

3. **Timers are re-pointed to run live.** Replace each page's hardcoded target with
   `new Date(Date.now() + OFFSET)` (~25–45 days) so it perpetually counts down. This is a
   deliberate reconstruction — the original air dates are historical.

4. **Card previews can trip a page's responsive breakpoint.** A gallery card renders the page
   in an iframe at ≈ `cardWidth × zoom` logical px (default `zoom = 4`, ≈950px). If a site has
   a high desktop→tablet breakpoint (Archer collapses ≤1010px; GoT "Season 3 · Redesign"
   looked oversized), the small card shows its mobile layout. Fix with a per-show
   `preview_zoom` or per-version `zoom` in the `SHOWS` data so the iframe renders wide enough
   to clear the breakpoint.

5. **Fonts: add `pokusin.com` to the Adobe Fonts (Typekit) kits.** Kits are domain-locked, so
   archived sites that use them only render on an allowed domain. Current kits:
   **GoT = `xkh8lla`** (Trajan), **Severance = `vuh2tap`** (eurostile-extended /
   input-mono-condensed) — adding `pokusin.com` to `vuh2tap` covers both Severance builds.
   Don't strip these Typekit `@import`s. For fonts with no live kit, substitute the closest
   Google Web Font (e.g. GoT's system Baskerville → Libre Baskerville).

6. **Severance is built from source, not preserved.** It's a Next.js app at
   `~/dev/severance-countdown`. To add/rebuild a season: copy the project; in `next.config.ts`
   set `output:"export"`, `basePath` + `assetPrefix` = the target subpath
   (e.g. `/countdowns/severance/s2`), `trailingSlash:true`, `images:{unoptimized:true}`; pick
   the season with `NEXT_PUBLIC_SEVERANCE_HOME_SEASON=<n>`; re-point the episode dates in
   `lib/seasons/season-<n>.ts` **relative to `now`** for the desired in-season state (e.g.
   mid-season so the episode bars show + a live next-episode countdown); remove the
   `GoogleAnalytics` tag; `pnpm build`; copy `out/` to the subpath.

7. **Presentation conventions.** Versions are either shown on the gallery shelf or collapsed
   into a `<details>` "Archived variants" on the show's archive page. A show only gets an
   archive page when it has collapsed items or a timeline (otherwise the gallery already shows
   everything). The Dexter timeline is surfaced as a plain link, not a card. Naming is unified
   to "Season N" / "Season N · Variant". Only Severance (the one still-live site) shows the
   **LIVE** chip. The `<link>` to `countdowns.css` carries a content-hash `?v=` to bust stale
   caches.

8. **Interaction details.** Clicking a card opens a scale + fade preview overlay
   (transform/opacity only, GPU-composited; reduced-motion falls back to a fade).
   `cmd`/`ctrl`/middle-click still opens the real page in a new tab; `Esc` / backdrop / ✕
   close it. A sticky top nav links to each show (horizontally scrollable on mobile, with
   scroll-spy). Keep shelf show-titles on a single line in the gutter — never let them wrap
   awkwardly or overflow into the cards.
