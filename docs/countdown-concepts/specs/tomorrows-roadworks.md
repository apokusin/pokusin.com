# Tomorrow’s Roadworks

Retained reference from the previous exploration round; not numbered in the new round.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Tomorrow’s Roadworks visual reference](../references/tomorrows-roadworks.jpg)

### Premise

Tomorrow remains under construction. Each successful shared reset adds highway. The archive is a roadside exhibition, with a construction clock centerpiece. Numerical values are proposed starting targets requiring visual tuning and device checks.

### Art style and composition

Preserve the reference’s densely crafted miniature diorama: rugged cobalt road, dusty pink concrete, tiny orange machines, and oversized black clock billboard. Place the clock in the upper-left third, its button pillar immediately right, and ascending road loops opposite. The road enters cropped at bottom left; retain this diagonal depth and the dangling rolled highway. Avoid replacing the landscape with a flat card grid.

### Palette and typography

Use cobalt #2356A6, concrete pink #D9AD94, safety orange #EE711D, lime-yellow #CED538, and warm black #191916. Large clock numerals use condensed tabular sans; labels resemble painted stencil lettering. Keep “Again,” D/H/M/S, small show names, and one home link. “Countdowns” becomes a dimensional concrete word near the foreground, rather than a paragraph introduction.

### Geometry and materials

Build the connected road from beveled extruded ribbons, with instanced guardrails, cones, and simplified construction vehicles. Concrete roughness starts at 0.86; asphalt at 0.78 with fine aggregate normals; painted truck metal at 0.43. The clock face has restrained rough black enamel and raised bezels. Reserve rectangular DOM preview regions on billboards. Preserve the rolled-road cylinder and hanging straps.

### Camera and lighting

Use an orthographic camera at roughly 32° downward pitch and 25° azimuth. Begin with warm upper-left key, cool sky fill, and subtle rear-right rim in a 1:0.35:0.18 intensity ratio. One directional light casts soft PCF shadows; ground-contact darkness comes from baked or simple projected contact shading. Keep distant structures atmospheric and previews sharp. Lighting values are proposals.

### Interaction contract

Scrolling travels along the road through numbered show stations; clicking a road marker gently centers its real preview. Retain native scrolling, keyboard navigation, anchor URLs, and the existing preview overlay. Hovering trucks or dragging the decorative road roll changes only the sculpture. The “Again” DOM button alone requests a shared reset; confirmed responses update deadline and tally. Pending or failed requests cannot add road, increment the count, or fabricate success.

### Motion choreography

On confirmation, compress the orange button for 90 ms, spin the real clock reels for 1080 ms per digit with 45 ms column staggering (about 1.4 s overall), then let the crane unroll a road segment over 1.6 s. A truck follows the extension for 2.2 s; no endless construction animation follows. Use a fixed pool of three extension segments, recycling an unseen segment after settling; successive presses never grow the route or geometry beyond its authored extent. Ordinary ticks roll changed digits only. Station centering takes 650 ms; cursor-driven camera parallax stays within 2°. A capped, fading tire-track cursor trail lasts 700 ms. The road roll’s hidden underside reveals “Long may I count.”

### Effects and render budget

Use one canvas, one shadow caster, instanced scenery, and a maximum of about 100 draw calls. Target 60 fps desktop and 30 fps phone; cap DPR at 1.5. Avoid expensive full-scene depth of field or continuous particle fog. Render on interaction and short active-motion windows; stop when hidden or offscreen.

### Responsive and fallback behavior

On phone, compress the route into a vertical serpentine; show clock and button before the first billboard. Minimum 44 px hit areas and readable preview widths take priority over scenic detail. Reduced motion removes camera drift, trails, crane choreography, and spinning resets. Without WebGL, an illustrated road background supports the same live DOM clock, controls, show anchors, and previews.

### Implementation boundaries

Use the static generator and vendored Three.js; add no framework or build pipeline. The generated image is a composition reference, not a runtime asset. Raster art may supply horizon or grain accents, never burned-in clock values or fake preview controls. Archived sites stay faithful and the shared API remains unchanged.

### Fidelity checks

Match the dominant concrete clock, orange pillar, blue foreground bend, elevated right loops, and crane-held road roll. Confirm previews stay readable, navigation survives keyboard and touch, and failed resets leave both clock state and construction unchanged.
