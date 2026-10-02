# Countdown archive — art direction QA

Final result: passed

The user requested a freer art project: stronger containers, type, background effects, ordering and motion, with fewer labels. This pass intentionally changes the selected themes rather than cloning their earlier composition.

## Reviewable pages

- [Royal / paper theatre](https://codex-next-countdown.pokusin-com.pages.dev/countdowns/?theme=royal)
- [Control / broadcast limbo](https://codex-next-countdown.pokusin-com.pages.dev/countdowns/?theme=control)

## Source and rendered evidence

Evidence directory: `/Users/pcyx/.codex/visualizations/2026/10/02/01a0fb3c-c709-76f2-8d29-692947f7dcc7/`.

Source visual truth is the fresh capture of the implementation before this pass: `royal-art-before.png` and `control-art-before.png`. Both were captured at 1280 × 900 CSS px / 2× density (2560 × 1800 pixels), then normalized to 1280 × 900.

Rendered desktop evidence uses the same viewport and normalization: `royal-art-final.png`, `control-art-final.png`. The scroll states `royal-art-wall.png` and `control-art-wall.png` show the actual archive containers and captions, at 1280 × 900. Phone evidence `royal-art-phone.png`, `control-art-phone.png`, and `control-art-fallback.png` uses 390 × 700 CSS px / 2× (780 × 1400), normalized to 390 × 700. Both themes also had bounds checked at 320 px.

Source and implementation were placed together, opened, and inspected:
- Full view: `royal-art-comparison.png`, `control-art-comparison.png` (2560 × 932 with a comparison header).
- Focused type/artwork/clock: `royal-art-detail-comparison.png`, `control-art-detail-comparison.png` (1600 × 540). Their deliberate crop does not represent viewport clipping; full views and 320 px checks establish the actual text bounds.
- Combined hero/archive showcase: `art-directions.png`.

Default scene / closed control lid was used for the main implementation captures. The earlier royal source has the secret revealed, while the main new royal capture has it hidden. That state difference was excluded from composition findings; successful reset and secret reveal were checked separately. Running clock values and totals naturally differ. Final contrast polish was checked numerically after the captures.

## Exploration and iteration

Considered a museum wall, a paper theatre, and an unfinished broadcast. Chosen treatments deliberately diverge: royal uses a continuous warm paper surface and uneven mounts; control uses a dark screen wall with newest work first. The shared backend remains unchanged.

Resolved findings from the first art pass:
1. **P2 — Guardians crossed the royal digits.** First desktop capture (`/private/tmp/royal-art-first.png`) showed the collision. Reduced the guardian height to 280 px, moved the clock below the artwork, and reserved separate space for the action and tally. `royal-art-final.png` shows clear digits.
2. **P2 — Caption alignment and console/type crowding.** The initial royal caption inherited flex layout, and the control title crowded the console. Set the caption heading to block layout, adjusted the control hero overlap and placed the instrument in front of the title. Final desktop captures show centered royal metadata and readable control digits; the small intentional foreground overlap is part of the poster composition.
3. **P2 — Phone title cropped its last letters.** `/private/tmp/control-art-phone.png` showed the clipped title. Changed the phone type scale from 24vw to 20.5vw and reduced its minimum size. `control-art-phone.png` shows both words in full; at 320 px the glyph bounds remain within the viewport.
4. **P2 — A tilted caption crowded the next picture mount.** The first royal wall capture showed almost no clearance below the second caption. Increased the three-picture row gap to 70 px. The final `royal-art-wall.png` shows the year and label clear of the next mount.
5. **P2 — Theme continuity during show navigation.** Made navigation URLs explicitly carry the theme and adjusted scroll-spy parsing. Verified control remains control after selecting Severance; `control-art-wall.png` is the resulting dark archive state.

No actionable P0/P1/P2 findings remain within this requested pass.

## Required visual surfaces

- **Fonts/type:** royal uses Cormorant Garamond with proper italic faces and IBM Plex Mono; control uses Archivo Black and IBM Plex Mono. The heading now dominates the composition, while captions stay quiet. Loaded rendering inspected, including the narrow viewport. Accessible heading names remain intact despite animated, decorative glyph spans.
- **Spacing/layout:** removed the pale rack containers and boxed initials. Royal has uneven picture mounts, a large leading work, and offset sections; control has grouped monitor frames on one continuous dark surface. Title, clock, action and tally retain separate space. Mobile shelves scroll horizontally; show names stay on one line. Taller poster heroes and revised ordering are intentional user-authorized changes.
- **Colors/background:** warm paper, brown ink and burgundy for royal; deep green-black, cream and warm orange for control. Royal reuses the existing archive's actual paper texture. Soft light and scanlines support each theme. Final small-text token contrast is 4.90:1 royal and 7.30:1 control against their base surfaces; the royal action is 6.54:1. This is not a claim of complete accessibility conformance.
- **Image quality:** original engraved guardians, illustrated fallbacks and actual archive previews are retained. Three.js remains the explicitly requested interactive rendering. The new frames do not replace or alter the archived sites themselves. Captures confirm no guardian/digit collision, misplaced fallback display or unintended title clipping.
- **Copy/content:** removed the gallery card descriptions, domains for retired sites, instructional hints, and verbose tally sentence. Kept titles, dates, a short subtitle, the total, and “Long may I count.” after a successful reset. No new product/dashboard labels were added.

## Interaction and motion checks

- Royal reset and control covered button both update the same countdown/tally. The cover opens separately from a reset. A failed Three.js import provides a working direct reset on the illustrated control button.
- Royal letters drift slowly, changing digits lift into place, and a successful reset creates a wave through the title. Control has a brief visual rewind and a title recoil. The accessible timer always retains the real deadline during the display gag.
- Decorative CSS motion pauses offscreen and when hidden. Reduced motion disables type drift, reveals and reset effects; fallback/reset was tested with reduced motion enabled.
- Archive previews open on phones and desktop; close and Escape start the closing transition. Modifier-click handling is unchanged. Theme-aware show navigation and 320 px title bounds checked.
- Backend date, request handling, atomic increment and environment isolation checks pass. Existing eight-request HTTP integration coverage remains unchanged; no backend code changed in this pass.
- Browser logs inspected. Expected blocked-import warning during fallback simulation, wallet-extension errors, and the existing Severance React 418 hydration error were present. No new error attributed to the theme implementation was found. Archived Severance rebuilding remains outside this change.

## Follow-up polish

P3: the procedural throne is still simpler than a bespoke sculpted model. That does not block this art-direction pass.

Checklist completed: both compositions, containers, type, backgrounds, chronological/reverse ordering, sparse copy, motion, shared reset, previews, narrow layouts, reduced motion, fallback and combined visual comparisons.
