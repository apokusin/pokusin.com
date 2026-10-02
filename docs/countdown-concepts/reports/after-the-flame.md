# Art direction review — After the Flame

Reviewed the actual [reference image](../references/after-the-flame.jpg), complete [spec](../specs/after-the-flame.md), and shared guide. The initial sections below are recommendations for implementation; the later implementation addendum and final acceptance distinguish source review from observed working-page visuals.

## The compelling idea

The candle is almost architectural. Its huge left silhouette, dark void and ascending archive ledges turn a ridiculous postponement into a ritual. The little crown stranded in a molten foreground is especially good: authority has become a trivial piece of debris. The composition succeeds because light crosses thick, irregular wax rather than because it contains many candle props.

## What needs to become intuitive

Again is engraved in a shallow pool and may read as decorative copy. Its rim needs a visible finger-sized concavity, contact shadow and local sheen response. Keyboard focus should light that same rim, rather than place a bright dashboard outline around the whole scene. Preserve an ordinary high-contrast focus outline as an accessible supplement.

The dark archive recesses can look like noninteractive scenery. Hover/focus should warm just the recess edge and lift the flat preview surface by 2 px. Wax cannot cover a show title or a target. The first recess must be visible without scrolling into darkness. Further ledges need a readable native-scroll route, not a maze of unlabelled candle rocks.

## Exact feel and state direction

- Use a quiet flame at rest, with unequal slow bends and a very small wick glow. Do not melt the whole canyon continuously, which would promise persistent material state the site does not have.
- Pending Again presses the pool by 2 px and narrows its highlight; it cannot raise wax. A confirmed reset begins at that pool: an amber vein moves toward the candle for 250 ms, viscous ridges climb over 1100 ms, and a wick arch reforms before the 1500 ms settle. The existing reel spin overlaps this sequence. Clock faces and archive surfaces remain rigid exclusion regions.
- Reverse flow must visibly travel upward against gravity. Generic swelling or a new flame would hide the central joke. Limit the rebuilt silhouette to 12–18% of the candle's visible height, then settle to the same authored resting composition without accumulation.
- Repeated successes retarget one bounded reversal. Remote updates lift only the flame for 400 ms and let the true digits/tally speak. Errors release the pool over 180 ms, leave wax unchanged and show the reserved short status.

## Discovery and the one easter egg

Use the crown already suggested in the foreground drip. Keep a small reflected gold edge visible. Its 44 px semantic target receives a tiny warm pool on hover/focus; touch activation works without heating or dragging the candle. Activation gives the crown a 5° bow and reveals “Long may I count.” locally for a short, dismissible beat. No extra ash collecting or secret cursor trails.

## Assets and execution risk

This is the most dangerous concept to approximate with basic cylinders: silhouette quality is the concept. It needs authored wax canyon contours with irregular ledges, drips, aperture frames and an art-only static fallback. Bake crevice AO and a thickness/normal map; do not add full scattering or fluid simulation. A separated flame mask and restrained additive glow are sufficient. Photograph previews and digits must remain independent, crisp DOM surfaces.

## Must preserve and prove

Preserve the towering cropped left candle, deep burgundy void, four foreground apertures and ascending right recesses. Cool ledges must remain matte beside the wet ridges. Verify that the upward flow is obvious from one success, the button is identifiable at rest, and no motion occludes actual content. Inspect all request states, repeat presses, remote updates, mobile reflow, focus, reduced motion and a failed WebGL path.

## Implementation addendum

The wax canyon uses a newly generated, transparent **art-only** layer, `assets/concepts/after-the-flame/canyon.webp` (about 368 KB), with no text, digits, screenshots, flame or crown. Its production prompt/source is recorded in the adjacent provenance file. Actual Three.js wick, masked additive flame, point light, bounded ash and upward viscous rivulets supply the interaction. This hybrid preserves irregular sculpted terraces instead of approximating the canyon with cylinders. Live screens and all numbers remain independent DOM.

The art layer owns the photographic perspective; an orthographic overlay camera at half-span 5.5 aligns physical light/flow with it. Reverse-flow geometry is **invisible at rest**, replacing an early rack-like arrangement of exposed tubes; ten irregular overlapping rivulets appear only after accepted success and fade within 1500 ms. The action is now actually seated in the wax pool after correcting inherited absolute child positions. Title is below Worlds, at 92 px. Desktop apertures occupy 34%/66%/53% (left/top/width); phone uses two pairs, with lower prints at 65% and 81% to retain their full labels. Georgia/Arial are the only themed UI faces. The static layer keeps the canyon language when WebGL fails.

A final independent desktop comparison found the upper Game of Thrones caption partially hidden by the two neighboring mounts. Its caption now sits 10 px above its own recess at widths ≥700 px; the scene, image bounds and phone layout remain intact. All three full show captions must be visible at rest, including wide desktop views where recess proportions diverge most.

A subsequent source review separates the crown's keyboard focus from pointer hover, so pointer departure cannot cancel a still-focused discovery cue. Even-numbered phone archive prints now use the same local 2 px lift for keyboard focus as for hover, preserving the phone arrangement rather than inheriting the desktop vertical stagger.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the corrected desktop, 390 px and 320 px captures against this spec. The monumental left wax mass, burgundy void, recessed clock and ascending archive ledges retain the ritual composition. The upper Game of Thrones caption now reads in full above its recess rather than disappearing behind Severance. Phones preserve the edge candle, first print, complete paired clock and clearly rimmed Again pool. The supplied archive continuation captures retain warm irregular mounts against the dark field.

**Code-reviewed feel:** Flow meshes remain hidden at rest and move upward during the bounded confirmation response; live surfaces remain independent. A remote update lifts the flame without repeating local flow, and reduced motion holds flame/ash while real values remain immediate. The supplied reduced-motion crown capture shows the one phrase in the wax gap below the action/tally, without covering them. Source and response stills establish these mechanisms and their material separation, not the subjective timing of the full reversal or measured device performance.

**Fidelity decision:** Accept the art-only sculpted canyon plus separately rendered light/flame/flow. Its irregular silhouette is essential; replacing it with uniform cylinders would lose the concept. The desktop caption relocation is an intentional readability correction, and actual archived sites replace invented reference screens. No remaining P0/P1/P2 visual defect was identified in the corrected compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.
