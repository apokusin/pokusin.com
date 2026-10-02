# Countdown themes — design QA

Final result: passed

Scope: two functional explorations of the selected royal archive and control room concepts. The user allowed layout changes and explicitly requested Three.js rendering, a shared reset button, and a press tally. These are thematic implementations, not pixel-for-pixel clones of the concept images.

## Visual evidence

Source visual truth:
- Royal: `/Users/pcyx/.codex/generated_images/01a0fb3c-c709-76f2-8d29-692947f7dcc7/exec-479baf4b-0dfe-4ce8-83cb-c8e87b63ad6d.png` — 1214 × 1295 px.
- Control: `/Users/pcyx/.codex/generated_images/01a0fb3c-c709-76f2-8d29-692947f7dcc7/exec-794c08ad-2e21-4a67-b409-d9716af8e657.png` — 1024 × 1536 px.

Evidence directory: `/Users/pcyx/.codex/visualizations/2026/10/02/01a0fb3c-c709-76f2-8d29-692947f7dcc7/`.

Browser-rendered implementation:
- `royal-implementation.png`: 1214 × 1295 CSS px, captured at 2× (2428 × 2590), normalized to 1×.
- `control-implementation.png`: 1024 × 1536 CSS px, captured at 2× (2048 × 3072), normalized to 1×.
- `royal-mobile.png`, `control-mobile.png`: 390 × 700 CSS px, captured at 2× and normalized to 1×.
- `control-fallback.png`: same phone viewport, with the Three.js module intentionally blocked.

Same-input source/implementation comparisons were opened and inspected:
- Full view: `royal-comparison.png`, `control-comparison.png`.
- Focused typography, timer, artwork and button: `royal-hero-comparison.png`, `control-hero-comparison.png`.
- Earlier comparison: corresponding `*-before.png` files.

State: default theme view, live timer, closed control cover, no preview dialog. The reference uses illustrative timer values and some invented archived seasons; implementation uses the repository's actual archive data. Current countdown values and press totals naturally differ between captures.

## Findings and iteration history

Resolved P2 findings:
1. Royal illustration crowded the outer timer digits. Moved the desktop clock inset to 28%; subsequent full-view and phone evidence shows clear digits.
2. Control display was undersized and the fallback could cover the canvas. Corrected camera framing, display depth and fallback visibility; final focused comparison shows legible seven-segment digits across the housing.
3. Phone press tally collided with show navigation. Restored 36 px below the hero; final mobile evidence shows the tally on its own line.
4. Control headline was too condensed compared with the source, and lighting washed the button pink. Replaced only the main headline with Archivo Black, adjusted phone sizing, lowered scene exposure and deepened the red material. Compare the saved before/final control comparisons.
5. Illustrated fallback digits were not anchored to the display. Grouped the illustration and digits, centered the digits inside its window, and made the visibly open fallback button reset on its first press. Final fallback screenshot and successful reset verify the correction.

No actionable P0/P1/P2 findings remain within the requested exploration scope.

## Required fidelity surfaces

- **Typography:** Cormorant Garamond gives the royal heading and timers their serif character; Archivo Black restores the control concept's wide, heavy headline; Barlow Condensed and IBM Plex Mono carry the rack labels and instrumentation. Actual loaded browser rendering checked. Show names remain on one line; long names and controls fit at 320 px. Font fallbacks retain the hierarchy.
- **Spacing/layout:** royal uses an editorial gallery, control uses enamel racks with a label gutter. Both keep original preview cards, show navigation and archive access. Larger interactive heroes, simpler ornamentation and taller cards are intentional adaptations for the requested 3D scenes, buttons and actual archive descriptions. Mobile cards form horizontal shelves without page overflow.
- **Colors/tokens:** cream, antique gold and muted brown for royal; warm gray enamel, charcoal and deep red for control. Adjusted exposure improves material and button contrast. Focus states remain visible.
- **Image quality:** generated transparent guardian, throne and console illustrations match the selected themes. No emoji substitute for hero artwork. True Three.js models intentionally replace the reference's still objects at the user's request; illustrated fallbacks retain richer engraved/hardware detail. Original archived sites remain untouched.
- **Copy/content:** new copy stays brief. “Long may I count.” appears after a successful reset. Existing archive dates, labels, descriptions and LIVE conventions remain authoritative rather than copying invented reference content.

## Verification

- Desktop layouts: 1440 px, plus matched source viewports 1214 px / 1024 px.
- Phone layouts: 390 px and narrow 320 px; verified document width and shelf/control bounds.
- Royal decree resets the shared countdown and increments its tally. Control cover opens separately, then the physical button resets it. Reloading the other theme shows the same state.
- Preview overlays open on desktop and phones; Escape and close dismiss them. Existing modifier-click behavior is retained in the unchanged event guard. Mobile shelf controls and sticky show navigation remain available.
- Reduced motion checked in the browser: static scene rendering and responsive layout remain usable.
- Three.js failure simulated: illustrated timer and direct button remain functional.
- Backend checks: end-of-month/leap-year dates, request handling, no-store responses, concurrent tally and live/preview row isolation. Real local Pages/D1 integration counted eight simultaneous presses without loss.
- Browser errors inspected: no errors attributed to the new theme scripts. Wallet-extension errors and unattributed MutationObserver errors were present; the new scripts/vendor contain no MutationObserver. An existing Severance iframe emits React hydration error 418; rebuilding that archived app is outside this gallery change.

## Follow-up polish

- P3: a bespoke sculpted throne could carry more engraving detail than the deliberately small procedural miniature.
- P3: source ornamented initials and engraved hardware plates are richer than the simplified gallery frames. Further embellishment can follow the user's theme selection.

Implementation checklist: responsive layouts, shared reset/tally, preview overlays, fallback rendering, reduced motion, atomic persistence, environment isolation and final visual comparisons completed.
