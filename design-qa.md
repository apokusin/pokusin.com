# Countdown worlds — design QA

**Final result: passed.** Reviewed October 2, 2026. Eight selectable implementations retain Royal and Control, the authoritative shared countdown, the press tally, digit reels and real archive previews. No final direction is selected. No remaining P0/P1/P2 defect was identified in the final art and interaction review.

## Review evidence

The Codex in-app browser rendered the local Cloudflare Pages/D1 preview at 1440 × 1024, 390 × 844 and 320 × 740. The screenshots include the browser's scrollbar allowance. Source/runtime pairs preserve reference composition without stretching and compare the resting scene at the same canvas size. Reference numbers and invented screenshots are placeholders; live values and faithful archive captures take priority.

- [Eight final desktop worlds](docs/countdown-concepts/qa/all-desktop.jpg)
- [390 px phones](docs/countdown-concepts/qa/all-mobile.jpg) and [320 px phones](docs/countdown-concepts/qa/all-320.jpg)
- [Themed archive continuations](docs/countdown-concepts/qa/all-archive-mobile.jpg)
- [Confirmed local reset frames](docs/countdown-concepts/qa/all-resets.jpg)
- [Reduced-motion crown discoveries](docs/countdown-concepts/qa/all-discoveries.jpg)
- [Optional scene-module failure](docs/countdown-concepts/qa/all-fallbacks.jpg) and [actual Fair WebGL context loss](docs/countdown-concepts/qa/fair-context-loss-320.jpg)

| World | Source/runtime comparison | Art-director report | Final refinements |
| --- | --- | --- | --- |
| Tomorrow’s Roadworks | [Pair](docs/countdown-concepts/qa/tomorrows-roadworks-comparison.jpg) | [Report](docs/countdown-concepts/reports/tomorrows-roadworks.md) | Supported billboards, larger clock, exposed road roll and connected reset strip on desktop and phone; instant focused crown under reduced motion. |
| Bubblegum Time | [Pair](docs/countdown-concepts/qa/bubblegum-time-comparison.jpg) | [Report](docs/countdown-concepts/reports/bubblegum-time.md) | Elastic scalloped belt and drums, separated prints, bounded drag, distinct mint/pink studio lighting. |
| After the Flame | [Pair](docs/countdown-concepts/qa/after-the-flame-comparison.jpg) | [Report](docs/countdown-concepts/reports/after-the-flame.md) | Sculpted art-only wax layer, real flame/light, reset-only rising rivulets, entire desktop caption clear of adjacent prints. |
| Low Tide, Later | [Pair](docs/countdown-concepts/qa/low-tide-later-comparison.jpg) | [Report](docs/countdown-concepts/reports/low-tide-later.md) | Diagonal moving shore, chipped chalk columns, shell action, phone pair layout and clear seconds digit. |
| Not Yet Ripe | [Pair](docs/countdown-concepts/qa/not-yet-ripe-comparison.jpg) | [Report](docs/countdown-concepts/reports/not-yet-ripe.md) | Irregular branch art, modeled citrus flesh/peel, calendar-derived ripeness, exposed digits and narrowed/repositioned 320 px fruit. |
| Still Drawing Tomorrow | [Pair](docs/countdown-concepts/qa/still-drawing-tomorrow-comparison.jpg) | [Report](docs/countdown-concepts/reports/still-drawing-tomorrow.md) | Graphite texture, stepped runner poses, liftable cel corners, corrected phone projection, self-hosted handwriting and clear eraser tally. |
| Held in Suspense | [Pair](docs/countdown-concepts/qa/held-in-suspense-comparison.jpg) | [Report](docs/countdown-concepts/reports/held-in-suspense.md) | Connected cantilever/bolts, studio chrome, suspended plates and bounded filings; separated phone title, action and tally. |
| The Almost Fair | [Pair](docs/countdown-concepts/qa/the-almost-fair-comparison.jpg) | [Report](docs/countdown-concepts/reports/the-almost-fair.md) | Matte four-color world, revised camera showing the full clock, continuous triangulated promenade, camera-relative movement and optional direct routes. |

Art-director subagents first reviewed each reference and uniform brief, then incorporated discoverability, physical feel and motion decisions into the specs. A separate final reviewer inspected source/runtime pairs, both phone widths, archive continuations and correction captures. Each report distinguishes observed visuals from behavior inspected in source.

## Functional checks

- All eight real UI reset actions succeeded against local D1, incrementing 293 → 301 one press at a time. Pending state cleared, the shared deadline reset, and no normal reset disclosed the easter egg. Earlier passes also exercised each world during its reset choreography.
- Another local visitor pressed the control, and the first visitor observed the shared tally move 292 → 293 when returning to the page. Remote observation and local success have separate scene responses.
- A blocked countdown request left the prior count unchanged, displayed the short failure status, restored Again and withheld the success gag. Backend checks accepted exactly 60 requests and rejected 20 in the 80-request limiter burst; no increments were lost.
- Desktop and both phone widths retained all four readable clock units, enabled 44 px or larger reset targets and no horizontal document overflow. Thematic archive continuations were inspected on desktop and phone. Royal and Control were also reviewed on desktop and 390 px for regressions.
- Preview opens the actual archived site. Close, backdrop, Escape and modifier/new-tab behavior remain supported. Background content becomes inert while the modal is open. Focus returns to the initiating card or Fair route/canvas. Escape within same-origin archived frames also closes the preview.
- Repeated close followed by a rapid reopen no longer lets an old timeout dismiss the new preview. Opening animation callbacks are invalidated when a close begins; child transitions cannot finish the modal's parent transition prematurely.
- Fair movement was exercised through native keyboard input and direct exhibit travel. A physical screen opened its real archive preview. Closing restored the player/camera pose; held input is cleared on overlay, cancel and blur. Walking is optional: direct route links and the full native archive remain available.
- Under reduced motion, each world's focus/tap crown discovery worked. Every revealed phrase was measured inside the viewport and clear of the reset and clock units. Reduced motion keeps authoritative values immediate; deliberate Fair navigation still renders while idle decoration sleeps.
- Blocking the optional exhibition module for all eight worlds preserved all 13 native archive links, the live clock, enabled Again, tally and discoverable crown. Actual Fair WebGL context loss showed the illustrated ground plan and centered working controls. Test-only network and motion overrides were cleared afterward.

## Implementation and verification

Only the selected world module and stylesheet load. The runtime uses one vendored Three.js renderer, bounded motion, finite initial effect ages, capped pixel ratio, visibility/offscreen pauses and resource cleanup. Intentional 3D geometry remains separate from live semantic DOM. Generated wax, branch and mineral scenery contain no clock, controls or archive screenshots. The original reference JPG checksums are unchanged; art-source and font-license records accompany the assets.

Passed the five existing Python checks, JavaScript syntax checks, generator regeneration and whitespace validation. Shared-countdown checks passed calendar/month-end dates, increments, preview/live isolation, request handling, spam boundary, minute rollover and cleanup. The local HTTP check also passed eight simultaneous presses and the 80-request limiter burst with ten requests in flight. The 60/30 fps figures in the briefs remain profiling targets, not measured hardware guarantees.

The [concept index](docs/countdown-concepts/README.md) links all eight previews, reports and uniform specifications.

The [earlier Royal/Control review](docs/design-qa/royal-control-review.md) preserves its original slot-motion, fallback, expiration/restart, retry and PR-review evidence.
