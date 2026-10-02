# Held in Suspense

New exploration 5; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

Art direction refinements are documented in the [review report](../reports/held-in-suspense.md) and incorporated below.

![Held in Suspense visual reference](../references/held-in-suspense.jpg)

### Premise

The countdown is an impossible balancing sculpture. Each press raises its counterweight and prolongs the moment before completion. The reference is a monumental chrome cantilever anchored in stone, not a primary-color mobile. The archive's screens and time plates hang from its structure, making the whole page one kinetic installation.

### Art style and composition

Preserve the zigzag metal beams rising from a rough stone plinth on the left, three suspended archive plates above, four clock plates below, and large cylindrical Again weight on the right. Keep bright architectural space and a sparse vertical rail of real show names with a short active dash. Unnamed ticks alone cannot carry navigation. Treat empty space as part of the installation; do not fill it with explanation or extra controls. Further archive groups form successive cantilever bays with varied proportions, never a circular carousel.

### Palette and typography

Architectural white `#EFEFEA`, charcoal `#222526`, steel `#A5AFB5`, with cool reflected window highlights. Maintain the tall, narrow black digits and restrained naming visible in the reference.


The implemented font pair is **Barlow Condensed + Libre Baskerville**, matching the intended exhibition lettering. Barlow Condensed owns live digits, title, show rail, tally, labels and header/menu/status/footer UI. Libre Baskerville owns Again, sparse archive links and the hidden line. All existing projected widths and positions remain fixed; type changes never create a second timer model or alter reel timing.

### Geometry and materials

Model connected flat beveled beams, visible pivot bolts, cable attachment points, taut cables, brushed plate faces, and the heavy cylinder. All visible plates must depend on supported structure; no disconnected screen copies in later bays. Metalness near 1; brushed faces roughness 0.35–0.55, polished edges 0.15–0.25. Use directional normal detail and an authored studio environment map. The stone base is matte and irregular. Iron filings are instanced short strokes, not individual physics bodies.


The working sculpture uses beveled extruded rails, flush pivot bolts, cables attached at the actual rail heights, varied archive elevations, and an irregular subdivided slate plinth. An authored monochrome rectangular studio environment is prefiltered once; a restrained directional brush/reflection profile strengthens the steel surface. The filing patch uses at most 2200 pooled instances, with no physics bodies or new allocation per press.

### Camera and lighting

Use a restrained perspective camera with verticals kept upright. Key/fill/rim around 1:0.55:0.35: broad rectangular window key, white-room fill, crisp cool rear rim. The environment must show elongated rectangular reflections rather than rainbow gradients. One soft floor shadow plus baked AO anchors cables, pivots, and base. Avoid bloom and mirror reflections that obscure timer plates.


The implemented desktop view targets `(0, 2, 0)` from `(0, 7.8, 24)` with a 5.85-unit orthographic half-span, retaining upright architectural relationships and enough downward view to read the ground filings. Phone framing uses a seven-unit horizontal field and one connected vertical support system, with timer plates in two pairs and supported archive plates below. The small wordmark stays in the clear header margin, avoiding bolts and the theme selector.

### Interaction contract

Pointer rotates filings into combs only within the authored lower-right ground patch; it does not obscure controls or replace ordinary scrolling. Keyboard focus gives an equivalent small plate lift. Show index anchors select supported bays through normal scrolling, and preview close restores the same bay, scroll and focus. Screens open the current preview overlay without requiring 3D aiming; decorative plate movement freezes while pointed at or focused. Again is a semantic button with a stable hit region aligned to a frontal cylinder endcap. Hover/focus moves the cap axially by 0.04 scene units over 110 ms; pressing adds another 0.04 and holds pressure while pending. The endcap never rotates away from the target. Success visibly tightens the cable, raises the counterweight, transfers a wave through the pivot chain, and resets reels. Failure releases pressure without a wave. Remote updates cause only a half-degree pivot correction. Touch affects filings only for gestures beginning in their patch, and yields to scroll and controls.

### Motion choreography

Heavy pendulum motion uses damped springs with limited angles: screens under three degrees and clock plates under one degree while readable. Normal reels roll in 420 ms; successful reset reels use 1080 ms per digit with 45 ms column staggering (about 1.4 s overall), settling left to right. At confirmation, real reel motion begins immediately and the visible cable tightens over 120 ms. Counterweight rise takes 700 ms, balance propagation through the authored pivot chain another 400 ms, then a two-second damped settle. Use deterministic bounded transforms; repeated clicks never accumulate spring energy. Filings follow with 100 ms response and return to their authored rest field over 600 ms after leaving. No uncontrolled physics, camera shake, or automatic scroll.

### Effects and render budget

Start below 90k visible triangles, 60 draw calls, and 2500 instanced filings. Use a prefiltered studio environment and analytic spring transforms rather than realtime reflections or a physics engine. Cap DPR at 1.5 desktop/1.25 mobile. Target 60/30 fps. Reduce filings to 400 and reflection resolution first; suspend rendering when hidden or offscreen.

### Responsive and fallback behavior

Mobile crops surrounding beams but keeps a recognizably connected vertical sculpture: clock in two pairs, cylinder button beside tally, archive plates below. DOM hit targets remain at least 44 px and previews frontal enough to read. Touch reshapes filings without controlling navigation. Reduced motion locks balance and updates values immediately. Static art-only fallback preserves steel silhouettes with functional DOM plates.

### Implementation boundaries

Use vendored Three.js and generated semantic DOM; preserve the no-build architecture. Never replace actual SHOWS content with mocked screenshots or make timer reading depend on canvas text. Keep existing preview/new-tab behavior and all archive variants. One tiny crown engraving beneath a pivot receives a restrained grazing-light glint on approach and reveals Long may I count through pointer, touch or keyboard activation. It is the only textual secret; do not add other decorative crowns.


Live clock units are individually projected onto their real suspended plates; the reset and tally follow the real counterweight endcap. Re-pin world widths when scale changes on mobile. All studio textures are authored locally in the module, not external HDR downloads. The archive continues as cable-supported cantilever bays with a restrained named show index.

### Fidelity checks

The stone anchor, stepped steel beams, rectangular archive plates, four suspended timer plates, and cylindrical counterweight must survive implementation. Reject floating space objects, generic chrome blobs, bright Calder colors, or dashboard framing. At rest the installation appears held under weight. During success, a viewer can trace force from Again through the cable and pivot chain; heavy weight motion stays distinct from the small readable plate correction. Verify error recovery, stable preview targets, readable plates throughout settling, named index focus, phone connectedness, and static/reduced-motion completeness.
