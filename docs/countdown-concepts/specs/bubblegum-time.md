# Bubblegum Time

Retained reference from the previous exploration round; not numbered in the new round.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Bubblegum Time visual reference](../references/bubblegum-time.jpg)

### Premise

The countdown is caught in bubblegum. Each confirmed reset gives it another breath before relaxation. Peelable archive prints hang from the same elastic structure. Numerical defaults are visual starting targets, not tested measurements.

### Art style and composition

Preserve the mint field, glossy pink diagonal clock strip, four pale mechanical drums, and enormous bubble cropped beyond the upper-right edge. A large Severance print hangs upper left; smaller prints punctuate opposite corners. Cropped black “Countdowns” lettering sweeps across the lower-left edge. Preserve this asymmetric editorial still life; avoid a centered blob above shelves.

### Palette and typography

Use pale mint #D6EAC9, candy pink #F372AC, highlight pink #FFC2DC, cream #F1EBD8, and ink #10120F. Pair a high-contrast editorial serif for title and show captions with condensed tabular sans for digits. Labels are “Again,” D/H/M/S, show names, optional season notation, and the home link; avoid explanatory captions.

### Geometry and materials

Model the gum as a thick ribbon with four drum openings, stretched bridges, pinned ends, and sparse dangling droplets. A connected balloon supplies the upper-right mass. Start gum roughness at 0.15, clearcoat at 0.8, and approximate translucency. Drums have pale enamel roughness 0.32; pins have metallic roughness 0.23. Prints have paper grain and modeled curled corners; keep real content flat and legible.

### Camera and lighting

Use shallow perspective, approximately 35 mm equivalent; balloon and title cross frame boundaries. Start with a broad upper-left key, soft front fill, and rear-right strip rim at 1:0.25:0.6. Long rectangular highlight bands should reveal stretched material curvature. Use a studio reflection texture and one soft shadow source; contact shadows anchor paper and gum. Any iridescence stays in highlights rather than recoloring preview content.

### Interaction contract

Follow gum tethers to hanging prints; native scrolling moves through the continuous composition. Focus or hover gently lifts a print; activation opens the existing preview overlay, and modifier-click retains normal links. Dragging unoccupied gum stretches nearby strands within limits and never changes shared state. Only confirmed “Again” requests update deadline, tally, and reset choreography. Pending or failed requests cannot inflate the balloon.

### Motion choreography

Gum follows the pointer with 140–220 ms damping and 12 px maximum displacement; a glossy dimple supplies the cursor effect. On confirmed reset, the button squashes for 100 ms, the balloon expands 12% over 650 ms, and the strip draws taut before settling over 1.4 s. Real digit reels spin for 1080 ms per digit with 45 ms column staggering, settling left to right in about 1.4 s overall. Hovered prints rotate no more than 4° and lift 8 px in 220 ms. One hidden underside curl reveals “Long may I count.”

### Effects and render budget

Use one moderately tessellated gum mesh, simple vertex deformation, and instanced droplets. Limit the scene to roughly 70 draw calls and cap DPR at 1.5. Prefer approximate reflection and translucency over refraction passes. Target 60 fps desktop and 30 fps phone. Render during pointer activity, scroll, and short settling windows; pause hidden or offscreen animation.

### Responsive and fallback behavior

On phone, rotate the strip horizontally, reduce balloon cropping, and keep drums on one line. Prints descend along one loose tether; avoid blocked tap areas and keep 44 px targets. Reduced motion shows immediate real values and removes stretch, wobble, and cursor dimples. Mint background and static pink framing preserve DOM interactions without WebGL.

### Implementation boundaries

Use the static generator, shared API, reels, and vendored Three.js; no framework or build step. The reference is an illustration guide, not an interactive asset. Raster elements may provide paper or background accents only. Keep clock, controls, tally, and real archive previews as accessible DOM elements; no canvas-only navigation or altered archived designs.

### Fidelity checks

Match the diagonal strip, cropped upper-right bubble, pale drums, lower-left title, and curling prints as one connected composition. Keep gloss from obscuring values. Test touch, keyboard, preview closing, reduced motion, and rejected reset behavior before declaring the concept faithful.
