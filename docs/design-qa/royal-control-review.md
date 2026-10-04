# Countdown archive — art direction QA

Final result: passed

The user requested a freer art project: stronger containers, type, background effects, ordering and motion, with fewer labels. This pass intentionally changes the selected themes rather than cloning their earlier composition.

## Reviewable pages and portable evidence

- [Royal / paper theatre](https://codex-next-countdown.pokusin-com.pages.dev/countdowns/?theme=royal)
- [Control / broadcast limbo](https://codex-next-countdown.pokusin-com.pages.dev/countdowns/?theme=control)
- [Published desktop compositions and archive walls](../../docs/design-qa/art-directions.jpg)
- [Phone compositions](../../docs/design-qa/phones.jpg)
- [Slot animation: before, moving and settled](../../docs/design-qa/slot-motion.jpg)
- [Illustrated fallback with reduced motion](../../docs/design-qa/fallback.jpg)
- [Control phone retry message](../../docs/design-qa/retry-phone.jpg)

These evidence images are committed and use repository-relative links. Desktop review used 1280 × 900 CSS px; phone review used 390 × 700, with additional bounds and fallback checks at 320 px. The contact sheet comes from actual captured animation frames, rather than a reconstructed animation. Live dates and totals naturally differ between captures and the published pages.

Earlier before/after comparisons were opened and inspected during the design pass, but their machine-only captures are not offered here as portable evidence. The earlier implementation can be reproduced from commit `c3608bd`; the art-direction revision is `c1ef4e8`, and slot-number rendering is `71d42ec`. The current gallery is generated from [generate.py](../../countdowns/generate.py); [index.html](../../countdowns/index.html), [countdowns.css](../../countdowns/countdowns.css), [themes.js](../../countdowns/themes.js) and [reels.js](../../countdowns/reels.js) are reviewable in the repository. Run the generator, then use the local Pages preview documented in [AGENTS.md](../../AGENTS.md) to reproduce the current layout and shared API.

## Exploration and iteration

Considered a museum wall, a paper theatre, and an unfinished broadcast. Chosen treatments deliberately diverge: royal uses a continuous warm paper surface and uneven mounts; control uses a dark screen wall with newest work first.

Resolved findings from the first art pass:

1. **P2 — Guardians crossed the royal digits.** Reduced the guardian height to 280 px, moved the clock below the artwork, and reserved separate space for the action and tally. The final desktop evidence shows clear digits.
2. **P2 — Caption alignment and console/type crowding.** Set the royal caption heading to block layout, adjusted the control hero overlap and placed the instrument in front of the title. Final desktop evidence shows centered royal metadata and readable control digits; the small intentional foreground overlap is part of the poster composition.
3. **P2 — Phone title cropped its last letters.** Changed the phone type scale from 24vw to 20.5vw and reduced its minimum size. The phone evidence shows both words in full; at 320 px the glyph bounds remain within the viewport.
4. **P2 — A tilted caption crowded the next picture mount.** Increased the three-picture row gap to 70 px. The final archive-wall evidence shows the year and label clear of the next mount.
5. **P2 — Theme continuity during show navigation.** Verified control remains control after selecting Severance. Generated navigation now uses hash-only links, preserving the selected theme even when the runtime rewrite is unavailable.

No actionable P0/P1/P2 visual findings remain within this requested pass.

## Required visual surfaces

- **Fonts/type:** royal uses Cormorant Garamond with proper italic faces and IBM Plex Mono; control uses Archivo Black and IBM Plex Mono. The heading dominates the composition, while captions stay quiet. Loaded rendering was inspected, including the narrow viewport. Accessible heading names remain intact despite animated, decorative glyph spans.
- **Spacing/layout:** removed the pale rack containers and boxed initials. Royal has uneven picture mounts, a large leading work, and offset sections; control has grouped monitor frames on one continuous dark surface. Title, clock, action and tally retain separate space. Mobile shelves scroll horizontally; show names stay on one line. Taller poster heroes and revised ordering are intentional user-authorized changes.
- **Colors/background:** warm paper, brown ink and burgundy for royal; deep green-black, cream and warm orange for control. [archive-paper.png](../../countdowns/assets/archive-paper.png) is a byte-for-byte copy of the existing [GoT Season 3 redesign texture](../../countdowns/got/s3-redesign/img/extra_clean_paper.png), already present on master in archive commit `0416f3e`. Both files have SHA-256 `f9d29fb254d272ee2670a0eb62a5feb3056cbf4c48a44dac1f4a6a0944e6ff3c`. Soft light and scanlines support each theme. Final small-text token contrast is 4.90:1 royal and 7.30:1 control against their base surfaces; the royal action is 6.54:1. This is not a claim of complete accessibility conformance.
- **Image quality:** engraved guardians, illustrated fallbacks and actual archive previews are retained. Three.js remains the explicitly requested interactive rendering. The new frames do not replace or alter the archived sites themselves. Captures confirm no guardian/digit collision, misplaced fallback display or unintended title clipping.
- **Copy/content:** removed the gallery card descriptions, domains for retired sites, instructional hints, and verbose tally sentence. Kept titles, dates, a short subtitle, the total, and “Long may I count.” after a successful reset. No new product/dashboard labels were added.

## Interaction and motion checks

- Royal reset and control covered button update the same countdown/tally. The cover opens separately from a reset. A failed Three.js import provides a working direct reset on the illustrated control button.
- Royal letters drift slowly, changing digits roll in clipped slots, and a successful reset creates a wave through the title. Both clocks spin their individual digits on reset; control renders those reels inside its actual Three.js display. The accessible timer always retains the real deadline during the display gag.
- Decorative CSS motion pauses offscreen and when hidden. Reduced motion disables type drift, reveals and reset effects; fallback/reset was tested with reduced motion enabled.
- Archive previews open on phones and desktop; close and Escape start the closing transition. Modifier-click handling is unchanged. Theme-aware show navigation and 320 px title bounds were checked.
- Browser logs were inspected. Expected blocked-import warnings during fallback simulation, wallet-extension errors, and the existing Severance React 418 hydration error were present. No new error attributed to the theme implementation was found. Archived Severance rebuilding remains outside this change.

## Slot-number follow-up

The user's reference was [Transitions.dev's spinning counter](https://transitions.dev/transitions/spinning-counter/). Implemented a small native digit-strip renderer, shared with the console's canvas texture. No dependency or site build was added. A normal tick rolls only changed digits downward in 420 ms; a reset spins every reel upward for 1080 ms with 45 ms between columns. The press tally rolls too. Tick updates arriving during the reset are queued and applied after landing.

Recorded real browser frames for both reset animations and inspected moving and settled frames. The committed [contact sheet](../../docs/design-qa/slot-motion.jpg) records those states. Expanded the royal reel window to retain the serif numerals' descenders; preserved the clock's layout height with matching margins.

- Desktop and 390 px screenshots were inspected. Both themes have no document overflow at 320 px. All four visible royal pairs remain within the viewport.
- Both buttons reset successfully. The control cover still opens before a reset. Console numbers and the royal clock land on the real deadline; press totals update with the same API.
- Reduced motion was tested on both themes: zero digit-strip animation cells after reset, immediate real values, and successful button/secret behavior.
- Blocked the Three.js import at 320 px and checked the illustrated control display: immediate reset with reduced motion, then 125 reel cells during the animated reset after restoring normal motion. Temporary media, width and network overrides were cleared.
- All 200 combinations of decimal start/end values and both directions passed wrap/landing checks. JavaScript syntax and generated-output whitespace checks pass.

Final result for the slot follow-up: passed. No new actionable P0/P1/P2 visual findings.

## PR-review fixes

- Added prefixed and unprefixed reel-mask declarations in the generator and regenerated all affected files.
- Generated show navigation uses hash-only URLs; the initial visible date label is derived from `NEXT_COUNTDOWN_DATE`.
- The ticker stops at an expired deadline and can restart when a shared reset supplies a future deadline. It continues calculating from wall time and the server offset.
- Added a small D1 spam guard: 60 accepted resets per IP per minute, with temporary minute/environment hashes, no stored raw IP addresses, and indexed opportunistic cleanup off the response path. Excess requests return 429 and `Retry-After`; the UI provides a brief retry message.
- [Backend checks](../../countdowns/check-shared-countdown.mjs) pass for calendar dates, sequential increments, environment isolation, request handling, the 60/61 boundary, minute rollover and cleanup. The SQLite adapter is explicitly a serial check.
- Real local Pages/D1 integration passed: eight simultaneous HTTP resets produced contiguous totals. A further burst of 80 requests with ten in flight at a time accepted exactly 60 and rejected 20 with `Retry-After`; no accepted increments were lost. A first attempt at 80 in flight exhausted the local Wrangler preview's sockets; the bounded version exercises the D1 race while keeping the preview stable.
- Browser verification seeded only local D1: the royal clock reached zero, showed its ended state, then restarted after a successful reset and continued ticking. Both themes displayed the API's 429 retry response at 390 px without document overflow. The final Control check caught and fixed a message/tally overlap; the retry state now reserves extra space and leaves an 8 px gap below the tally. Temporary viewport overrides were cleared.
- Applied the idempotent schema to the site's existing Cloudflare D1 database before deploying this revision; existing countdown rows were retained.

## Follow-up polish

P3: the procedural throne is still simpler than a bespoke sculpted model. That does not block this art-direction pass.

Checklist completed: both compositions, containers, type, backgrounds, chronological/reverse ordering, sparse copy, motion, shared reset, previews, narrow layouts, reduced motion, fallback and combined visual comparisons.
