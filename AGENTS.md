# AGENTS.md — pokusin.com

A hand-written, **fully static** personal site. There is **no build step and no `package.json`** — files are served verbatim. Deployed on Vercel from the `master` branch (pushes auto-deploy to pokusin.com); zero-config (no `vercel.json`). The countdowns archive currently lives on the `countdowns-archive` branch / open PR.

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
