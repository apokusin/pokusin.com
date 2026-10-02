# Held in Suspense

New exploration 5; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Held in Suspense visual reference](../references/held-in-suspense.jpg)

### Premise

The countdown is an impossible balancing sculpture. Each press raises its counterweight and prolongs the moment before completion. The reference is a monumental chrome cantilever anchored in stone, not a primary-color mobile. The archive's screens and time plates hang from its structure, making the whole page one kinetic installation.

### Art style and composition

Preserve the zigzag metal beams rising from a rough stone plinth on the left, three suspended archive plates above, four clock plates below, and large cylindrical Again weight on the right. Keep bright architectural space and a sparse vertical show index. Further archive groups form successive cantilever bays with varied proportions, never a circular carousel.

### Palette and typography

Architectural white `#EFEFEA`, charcoal `#222526`, steel `#A5AFB5`, with cool reflected window highlights. Use Barlow Condensed for clock numerals and navigation, with Libre Baskerville for Again and the occasional show label. Maximum two actual font families; maintain the tall, narrow black digits and restrained naming visible in the reference.

### Geometry and materials

Model flat beveled beams, visible pivots, taut cables, brushed plate faces, and the heavy cylinder. Metalness near 1; brushed faces roughness 0.35–0.55, polished edges 0.15–0.25. Use directional normal detail and an authored studio environment map. The stone base is matte and irregular. Iron filings are instanced short strokes, not individual physics bodies.

### Camera and lighting

Use a restrained perspective camera with verticals kept upright. Key/fill/rim around 1:0.55:0.35: broad rectangular window key, white-room fill, crisp cool rear rim. The environment must show elongated rectangular reflections rather than rainbow gradients. One soft floor shadow plus baked AO anchors cables, pivots, and base. Avoid bloom and mirror reflections that obscure timer plates.

### Interaction contract

Pointer rotates nearby filings into combs and slightly biases the suspended weights; keyboard focus gives an equivalent plate lift. Show index anchors select bays through normal scrolling. Screens open the current preview overlay without requiring 3D aiming. Again is a semantic button aligned to the cylinder endcap. Pending adds subtle pressure; success raises the counterweight, transfers a wave through beams, and resets reels. Failure returns quietly. Remote updates cause a tiny balance correction.

### Motion choreography

Heavy pendulum motion uses damped springs with limited angles: screens under three degrees and clock plates under one degree while readable. Normal reels roll in 420 ms; successful reset reels use 1080 ms per digit with 45 ms column staggering (about 1.4 s overall), settling left to right. Counterweight rise takes 700 ms, balance propagation another 400 ms, then a two-second damped settle. No uncontrolled physics, camera shake, or automatic scroll.

### Effects and render budget

Start below 90k visible triangles, 60 draw calls, and 2500 instanced filings. Use a prefiltered studio environment and analytic spring transforms rather than realtime reflections or a physics engine. Cap DPR at 1.5 desktop/1.25 mobile. Target 60/30 fps. Reduce filings to 400 and reflection resolution first; suspend rendering when hidden or offscreen.

### Responsive and fallback behavior

Mobile crops surrounding beams but keeps a recognizably connected vertical sculpture: clock in two pairs, cylinder button beside tally, archive plates below. DOM hit targets remain at least 44 px and previews frontal enough to read. Touch reshapes filings without controlling navigation. Reduced motion locks balance and updates values immediately. Static art-only fallback preserves steel silhouettes with functional DOM plates.

### Implementation boundaries

Use vendored Three.js and generated semantic DOM; preserve the no-build architecture. Never replace actual SHOWS content with mocked screenshots or make timer reading depend on canvas text. Keep existing preview/new-tab behavior and all archive variants. One tiny crown engraving beneath a pivot reveals Long may I count through pointer or keyboard activation.

### Fidelity checks

The stone anchor, stepped steel beams, rectangular archive plates, four suspended timer plates, and cylindrical counterweight must survive implementation. Reject floating space objects, generic chrome blobs, bright Calder colors, or dashboard framing. Verify mechanical causality, successful reset weighting, error recovery, readable plates, index focus, phone composition, and static/reduced-motion completeness.
