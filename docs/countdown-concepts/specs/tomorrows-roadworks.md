# Tomorrow’s Roadworks

Retained reference from the previous exploration round; not numbered in the new round.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

Art direction refinements are documented in the [review report](../reports/tomorrows-roadworks.md) and incorporated below.

![Tomorrow’s Roadworks visual reference](../references/tomorrows-roadworks.jpg)

### Premise

Tomorrow remains under construction. Each successful shared reset adds highway. The archive is a roadside exhibition, with a construction clock centerpiece. Numerical values are proposed starting targets requiring visual tuning and device checks.

### Art style and composition

Preserve the reference’s densely crafted miniature diorama: rugged cobalt road, dusty pink concrete, tiny orange machines, and oversized black clock billboard. Place the clock in the upper-left third, its button pillar immediately right, and ascending road loops opposite. Keep three readable visual levels: the clock/button silhouette, the connected blue route and supported billboards, then small construction detail. Remove incidental generated slogans, excessive vegetation and spare machines before reducing the main road silhouette. The road enters cropped at bottom left; retain this diagonal depth and the dangling rolled highway. Avoid replacing the landscape with a flat card grid.

### Palette and typography

Use cobalt #2356A6, concrete pink #D9AD94, safety orange #EE711D, lime-yellow #CED538, and warm black #191916. Large clock numerals use condensed tabular sans; labels resemble painted stencil lettering. Keep “Again,” D/H/M/S, small show names, and one home link. “Countdowns” becomes a dimensional concrete word near the foreground, rather than a paragraph introduction.


The implemented font pair is **Barlow Condensed + Libre Baskerville**. Barlow Condensed owns the industrial clock, dimensional title, station names, navigation, tally, labels and all header/menu/status/footer UI. Libre Baskerville is reserved for Again and the single hidden line. Generic sans/serif fallbacks are resilience only; do not introduce Impact, Arial, IBM Plex Mono or Cormorant as an additional selected UI face.

### Geometry and materials

Build the connected road from beveled extruded ribbons, with instanced guardrails, cones, three recognizable low-detail construction vehicle silhouettes and a crane with visible cables. Use authored mineral outcrops and believable billboard supports; scattering boxes behind cards does not satisfy the miniature landscape. Concrete roughness starts at 0.86; asphalt at 0.78 with fine aggregate normals; painted truck metal at 0.43. The clock face has restrained rough black enamel and raised bezels. Reserve rectangular DOM preview regions on billboards. Preserve the rolled-road cylinder and hanging straps.


The working scene adds an original art-only `mineral-coast.jpg` scenery layer: pink mineral coastline, open ground and sky, generated separately from the concept mock. It contains no roads, displays, labels, digits or controls. Real geometry supplies the connected road ribbons with visible thickness, instanced lane marks and guardrail posts, tubes for guardrails, crane/roll, concrete clock/pillar, billboard edge supports and crafted roller. Foreground mineral meshes are displaced and grain-shaded; never substitute the complete concept screenshot as a background.

### Camera and lighting

Use an orthographic camera at roughly 32° downward pitch and 25° azimuth. Begin with warm upper-left key, cool sky fill, and subtle rear-right rim in a 1:0.35:0.18 intensity ratio. One directional light casts soft PCF shadows; ground-contact darkness comes from baked or simple projected contact shading. Keep distant structures atmospheric and previews sharp. Lighting values are proposals.


The implemented desktop comparison uses an orthographic half-span of 5.75 units, target `(0, 2, 0)` and view position `(0, 8.7, 23)`, with the clock enlarged 28% relative to the first prototype. This fills the upper-left composition instead of leaving a blank upper band. Phone framing derives its vertical span from a 7.3-unit horizontal field and recomposes the three supported mounts vertically. Re-register projected DOM widths whenever object scale changes; the projection helper interprets width in world units.

### Interaction contract

Native vertical scrolling follows a visibly connected road through numbered show stations; clicking a road marker centers its real preview through ordinary scrolling. Do not capture the wheel, simulate driving, or move the visitor after a reset. Keep station markers and show names visible at rest. Hover/focus brightens the station lamp over 120 ms and lifts only its marker by at most 3 px; the preview hit region remains stable, and decorative billboard movement freezes while pointed at or focused. Preview close restores the same scroll position and focus. Retain keyboard navigation, anchor URLs, modifier-click and the existing preview overlay. Decorative roll dragging begins only on its visible free edge and changes only the sculpture. Trucks must not mimic clickable controls. The “Again” DOM button alone requests a shared reset; confirmed responses update deadline and tally. Pending or failed requests cannot add road, increment the count, or fabricate success.

### Motion choreography

On initial press, compress the orange cap over 90 ms and hold it under request pressure. At confirmation, immediately spin the real clock reels for 1080 ms per digit with 45 ms column staggering (about 1.4 s overall). After a 140 ms catch-release beat, let the crane unroll a visibly attached road segment over 1.6 s: slow start, faster middle and heavy settling tail. A single truck follows only once the segment is visibly stable, travels for 2.2 s and disappears behind a pier. The temporary strip folds back into the authored route outside view; it does not permanently lengthen the archive. No endless construction animation follows. Use a fixed pool of three extension segments, recycling an unseen segment after settling; successive presses never grow the route or geometry beyond its authored extent. Ordinary ticks roll changed digits only. Station centering takes 650 ms; cursor-driven camera parallax stays within 2°. A capped, fading tire-track cursor trail lasts 700 ms, stays on free terrain and disappears over controls or previews; disable it on touch. It must not imply a road-drawing tool. Lifting the roll exposes one small crown on its underside. Touch or keyboard activation of the roll can lift it, and activation of the crown reveals “Long may I count.” Do not add other textual jokes or decorative crowns.

### Effects and render budget

Use one canvas, one shadow caster, instanced scenery, and a maximum of about 100 draw calls. Target 60 fps desktop and 30 fps phone; cap DPR at 1.5. Avoid expensive full-scene depth of field or continuous particle fog. Render on interaction and short active-motion windows; stop when hidden or offscreen.

### Responsive and fallback behavior

On phone, compress the route into a vertical serpentine; show clock and button before the first billboard. Minimum 44 px hit areas and readable preview widths take priority over scenic detail. Reduced motion removes camera drift, trails, crane choreography, and spinning resets. Without WebGL, an illustrated road background supports the same live DOM clock, controls, show anchors, and previews.

### Implementation boundaries

Use the static generator and vendored Three.js; add no framework or build pipeline. The generated image is a composition reference, not a runtime asset. Raster art may supply horizon or grain accents, never burned-in clock values or fake preview controls. Archived sites stay faithful and the shared API remains unchanged.


The scenery asset and its generation provenance live under `assets/concepts/tomorrows-roadworks/`. Its CSS also supplies the no-WebGL scenery fallback. The archive continues through unequal roadside billboard stations with native scrolling, supported mounts and restrained safety markers; it is not a generic shelf below a hero.

### Fidelity checks

Match the dominant concrete clock, orange pillar, blue foreground bend, elevated right loops, and crane-held road roll. At rest, Again, the timer and the first billboard are identifiable without instructions. During success, a viewer can trace the strip from crane to connected route; no element looks like unrelated confetti. The first scroll reveals another exhibit rather than an empty scenic gap. Confirm previews stay readable, navigation survives keyboard and touch, the crown is discoverable without resembling another reset control, and failed resets leave both clock state and construction unchanged.
