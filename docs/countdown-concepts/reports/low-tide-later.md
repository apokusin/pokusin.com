# Art direction review — Low Tide, Later

Reviewed the actual [reference image](../references/low-tide-later.jpg), complete [spec](../specs/low-tide-later.md), and shared guide. The initial sections below are recommendations for implementation; the later implementation addendum and final acceptance distinguish source review from observed working-page visuals.

## The compelling idea

The Prussian-blue/white diagonal gives this a photographic, almost printed confidence. The chalk cylinders are convincingly exposed by the water, and the rust shell is an economical accent. A tide that returns when someone postpones the future is understandable without a paragraph. Salt-worn prints let the archive belong to the shore rather than sit in a UI grid.

## What needs to become intuitive

Water covering the photographs in the image is atmospheric but unsafe as an interaction rule. Keep actual screenshot centers and labels optically dry; wet edges and their shadows can carry the effect. A print should be a link everywhere inside its flat image, not only on a curled corner. No visitor should think a photo must be fished out first.

The shell needs a shallow inset Again face and a 2 px press so it reads as an action rather than a found object. Keep the tally on dry ground alongside it. The generated share symbol is not part of the concept. Discoverable show-index anchors are enough navigation; do not add a tide-height control, map legend or scroll mode.

## Exact feel and state direction

- Ripple rings are elliptical in the camera view, have one restrained crest and disappear inside 900 ms. Space pointer sampling at least 120 ms and cap concurrent ripples at eight. A stationary phone tap can ripple; a vertical swipe must scroll without rippling or pointer capture.
- Pending presses the shell but keeps tide height fixed. On success, one broad water front approaches from the upper-left for 450 ms, briefly curls around the cylinder bases, then eases back over 1150 ms. The maximum wet line stays below 30% of each cylinder and never crosses live digit, button, label or screenshot exclusion regions. The existing reel sequence overlaps it.
- A thin blue contact stain remains on the cylinder base after the wave, without incrementally raising water on repeat presses. Further confirmed presses retarget the single front; remote updates produce one small tide-edge ripple. A rejected request releases the shell and produces no wave.
- Idle motion is broad, low and slow. Caustics must not flicker across the timer or move like a screensaver. Stop paper movement on focus and while a preview is open.

## Discovery and the one easter egg

Place the crown in one shallow tide pool beside the shell, made from the same chipped matte chalk as the clock stones. A rough white point peeks above a quiet blue veil. A nearby pointer/focused semantic target clears incidental water detail enough to glimpse it; tap/Enter reveals “Long may I count.” as a brief handwritten note beside the pool. Do not require tide timing, dragging water or repeated successful resets to discover it.

## Assets and execution risk

Author the shoreline mask, chalk silhouettes, tide stains and shell ridges. Two inexpensive normal layers and a masked Fresnel surface are sufficient; a true ocean simulation would weaken the flattened cyanotype composition. Use faithful archive captures on dry paper centers, and art-only salt/seaweed layers without invented labels. The static fallback must preserve the actual diagonal split and orange action.

## Must preserve and prove

Preserve the white/blue diagonal, chalk apertures, shell accent and irregular photo spacing. One successful reset should read as the sea returning while every action stays dry and readable. Test dry target masks, touch scrolling, focus, preview restoration, repeated and remote presses, rejected requests, reduced motion and narrow screens. Water may be playful; navigation must not become slippery.

## Implementation addendum

The tide is procedural Three.js: one masked displaced water plate with broad currents, restrained cyanotype grain/caustic veins and eight bounded ripples; four chipped chalk cylinders have authored irregular tops and procedural granular diffuse/bump; the shell has actual raised ridges. DOM digits sit directly on the chalk, with no square tile backing in the live scene. Native taps/scroll and ordinary full-photo preview links remain intact. A confirmed wave peaks at 450 ms, recedes over 1150 ms, and never covers live content because the water stays behind independent dry DOM surfaces.

An orthographic overlay at half-span 5.5 preserves the diagonal image plane. The top Severance print is 67%/6%/26% (left/top/width), clearing the seconds cylinder. The home link is paper-white over water. Phone repositions the **actual** stones into two pairs and moves shell/crown into the viewport; it does not merely shrink the desktop row. The reduced/WebGL fallback keeps chalk-shaped DOM framing and dry controls. Only Georgia/Arial are used in themed UI. No ocean engine, fluid service, full-scene generated bitmap or fictitious share control was added.

A subsequent source review gives remote observations their own one-shot ripple queue, independent of local pointer sampling; continuous mouse movement can no longer starve that response. The crown now shares the stones' matte granular chalk material, with chipped band/points and a small blue pool whose veil attenuates on hover or keyboard focus; focus remains active after pointer departure. Local water detail quiets in that region as well. The expired-countdown note now follows the action in normal flex flow, and even-numbered phone prints use the same bounded keyboard lift as hover. The no-backing rule applies to desktop; the rounded translucent phone contrast backings observed below remain an explicit accepted exception.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the final desktop, 390 px and 320 px captures against this spec. The blue/white diagonal remains the organizing shape, and the staggered chalk cylinders are distinct from the dry paper and rust shell. The upper print clears the seconds numeral. Both phone widths retain two readable stone pairs, the first photograph and a separate shell action; the white home link is legible against blue. Small rounded phone backings trade some exposed chalk texture for consistent digit contrast. The supplied archive continuation captures keep the slanted shore edge and separated dry prints instead of returning to neutral shelf containers.

**Code-reviewed feel:** Eight ripple slots, a 120 ms sample gate and a short stationary-tap test bound water feedback. A vertical swipe does not qualify as a tap or acquire pointer capture. A confirmed reset owns one short surge, while remote state causes a smaller edge response. The water renders behind independent live surfaces, so the decorative flood cannot physically cover an archive hit region or timer glyph. These are source checks, not motion or device-performance measurements.

**Fidelity decision:** Preserve the flattened cyanotype shore rather than adding realistic ocean scenery. The simple shell is sufficient because Again and its press count remain frontal. Actual archived work intentionally replaces invented reference artwork. No remaining P0/P1/P2 visual defect was identified in the supplied final compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.
