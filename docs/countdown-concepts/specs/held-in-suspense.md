# Held in Suspense

Read the [shared guide](../GUIDE.md), [contract](../../../countdowns/concepts/CONTRACT.md) and [art review](../reports/held-in-suspense.md). This revision supersedes the earlier metal acceptance: albedo stripes and high fill light were disguising a blockout as brushed chrome. The following material/light recipe is concrete, while rendered acceptance and measured performance remain separate.

![Held in Suspense reference](../references/held-in-suspense.jpg)

### Premise

An unnecessarily engineered balance prolongs an ordinary wait. A monumental cantilever holds real countdown plates and archive screens; Again is the frontal end of its hanging counterweight. Force visibly passes through cables, pivots and connected beams.

### Art style and composition

Protect the rough slate anchor at lower left, ascending zigzag cantilever, three unequal hanging screens above, four long timer plates below and a large right counterweight. The reference occupies a pale architectural room, with strong dark reflected flags that make bright metal legible. Empty wall and floor are deliberate exhibition space. Do not substitute a grey torus, floating panels or technology-demo chrome. A sparse named show rail leads to further suspended bays; each bay continues the same support language instead of ending in a conventional card grid.

### Palette and typography

Warm architectural white `#EFEFEA`, charcoal `#222526`, neutral silver with cool window reflections and dark slate. Barlow Condensed owns tall numerals, D/H/M/S, labels, title and named index. Libre Baskerville owns Again, sparse archive links and Long may I count. Live DOM surfaces become transparent over physical plates while graphics are healthy; actual metal geometry supplies edges and reflection. Native values stay black and legible, independent of specular motion.

### Geometry and materials

Flat rectangular rails have visibly beveled solid thickness and connected overlap, flush collars and hexagonal pivot heads, dark bolt sockets and taut paired cables. Plates use 512² directional microbrushing, neutral silver albedo, metalness 1, roughness .20, bump .001 and anisotropy .52; longitudinal scratches are subpixel, not a painted gradient or repeated thick bars. Polished perimeter and counterweight collars use roughness .12–.18; dark machined inserts use roughness .44, metalness .85. Counterweight has cylindrical body, two rolled collars, rear axle bracket and a frontal stable cap. Slate base is irregular and displaced, with cleavage lines and small pale mineral flecks, roughness .98, bump .09. Floor is clean warm matte mineral, roughness .82, with subtle contact shading; granular concrete relief belongs to the slate/construction concept rather than this architectural floor. All hanging screens and clock plates have material side depth, mount screws and cable attachment thimbles. Nearly flat plate faces have .075 units of shallow camber; beam profiles bow at most .06 units between fixed endpoints. These manufactured curves change real reflection normals without turning flat steel into chrome blobs. The angled solid collar meets the tilted weight at its true body ring and joins a frontal machined endcap, protecting the action’s readable circular face.

### Camera and lighting

Orthographic camera, upright verticals and no drift. Desktop target `(0,2,0)`, position `(0,7.8,24)`, vertical half-span `max(5.85,8.4×stageHeight/stageWidth)` protects a 16.8-unit horizontal field. Use broad warm-white key at `(-8,12,10)`, intensity 2.6; cool hemisphere .72 and rear-right rim .72. A single shadow caster uses 2048 desktop / 1024 phone and 24-unit fitted bounds. Create a true studio PMREM from a 5.7-unit off-axis luminous window, one broad graphite flag crossing the plate normals, one narrow dark flag, a cool narrow side strip, a horizontal overhead window for the tilted weight and pale floor bounce; never paint reflections into the metal albedo. The environment has a dark field so real chrome reflects alternating dark/light architecture. The window/flag boundary must cross the resting plate normals; a window so broad that every plate sees uniform white is a material-fidelity defect. Never repeat horizontal reflection strips around the counterweight. Pointer motion may rotate the environment by at most .025 radians, eased to rest; no ambient rainbow cycle. Window-shaped floor light and dark contact under the slate/filings establish architectural volume. No bloom or mirror floor.

### Interaction contract

The real Again button stays frontal and stable. Hover/focus presses the endcap axially .04 scene units over 110 ms; pending adds .04 and holds pressure. Only confirmed API responses raise the counterweight and increment the true tally. Real preview anchors remain stable during hover/focus; closing restores the same bay, scroll and focus. Genuine modifier/new-tab semantics remain. Desktop filings react only within the authored lower-right patch. On phone, 180 pooled filings occupy a frontal tray attached to the support; contact must begin there, holds 280 ms, never captures native scroll, and clears on cancellation. A tiny engraving beneath one pivot contains the sole crown and reveals Long may I count through pointer/touch/keyboard.

### Motion choreography

Confirmed reset immediately starts real shared reels (1080 ms, 45 ms per-column delay). Cable tension precedes a .55-unit counterweight rise over approximately 820 ms, followed by a 2.4-second deterministic damped settle. Plates move below one degree, supported screens below three degrees, and focused/hovered screens freeze. Remote updates give a half-degree pivot adjustment, not a full ceremony. Filings respond in 100 ms and relax over approximately 600 ms along the shortest angular path. Material glints are caused by these bounded physical transformations and slight pointer environment rotation. No uncontrolled spring energy, camera shake, autonomous swinging or motion added solely to make a screenshot look busy.

### Effects and render budget

One shared canvas, one PCF shadow caster, one prefiltered studio environment, pooled filings and deterministic transforms. Proposed ceiling 100k triangles / 110 draw calls / 2200 filings; no hardware FPS claim without profiling. Reduce filings and reflection resolution before removing bevels, cables or contacts. No realtime reflection probes, screen-space mirror, physics engine, chromatic aberration, bloom or animated noise. Reuse every resource across presses; dispose maps, environment target, geometry and listeners with the scene.

### Responsive and fallback behavior

Below 700 px reassemble one connected upright support system: two pairs of real clock plates, a weight with separated tally, an attached filing sample tray, then three supported preview faces. Seven-unit horizontal field determines vertical span from stage aspect. Preserve 44 px targets and readable physical plate margins at 320 px; don’t hide the connection structure or shrink the entire desktop silhouette. Reduced motion locks balance, filings and reflections while real values update immediately. Graphics failure restores pale architectural DOM plates, native clock/action/tally, named links and faithful previews.

### Implementation boundaries

Use static files and vendored Three.js, no frontend framework or build system. Local `engineered-materials.js` authors directional microtextures and a real prefiltered studio; no external HDR download or painted mirror image. Continue shared API, timing/reel/focus behavior and true SHOWS data. No archive page redesign or duplicated countdown model. The generated reference is art direction, never runtime background.

### Fidelity checks

At rest the sculpture must appear held under weight, with smooth broad reflections interrupted by real bevels/bolts and matte stone contact. Reject brushed wallpaper bars, washed-out thin cables, generic metallic cylinders without collars, floating grey panels, or card/dashboard borders. Inspect desktop, 390 px, 320 px and a side-by-side reference comparison; test material response, force transfer and filing contact in actual motion. Validate error recovery, readable plates throughout reset, genuine links, preview restoration, reduced motion, graphics fallback and hidden crown separately. Revised visual acceptance is pending rendered screenshots; source settings alone are not acceptance.
