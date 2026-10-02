# Bubblegum Time

Retained reference from the previous exploration round; not numbered in the new round.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Bubblegum Time visual reference](../references/bubblegum-time.jpg)

Art direction reviewed against the actual visual; see the [individual report](../reports/bubblegum-time.md). The recommendations below are part of the implementation brief.

### Premise

The countdown is caught in bubblegum. Each confirmed reset gives it another breath before relaxation. Peelable archive prints hang from the same elastic structure. Numerical defaults are visual starting targets, not tested measurements.

### Art style and composition

Preserve the mint field, glossy pink diagonal clock strip, four pale mechanical drums, and enormous bubble cropped beyond the upper-right edge. A large Severance print hangs upper left; smaller prints punctuate opposite corners. Cropped black “Countdowns” lettering sweeps across the lower-left edge. Preserve this asymmetric editorial still life; avoid a centered blob above shelves.

Keep still, mint breathing space around the first working photograph. Metal pins and matte paper provide contrast with the glossy gum. A photograph should appear selectable before any gesture is discovered: flat image, small cast shadow, lifted corner and readable caption. Cropping applies to balloon/title, never to live digits or a paper target.


Implemented framing uses an orthographic half-span 5.5 for alignment of the live DOM with the connected 3D belt. Phone uses half-span 6.6 and a recomposed horizontal drum row; lower photographs start at 55% and 72% of the 1050 px hero, leaving their captions readable. Cropped title yields to these targets.

### Palette and typography

Use pale mint #D6EAC9, candy pink #F372AC, highlight pink #FFC2DC, cream #F1EBD8, and ink #10120F. Use Georgia for the editorial title/show captions and Arial at heavy weight with tabular digits for the clock; use Arial for small navigation/status. Labels are “Again,” D/H/M/S, show names, optional season notation, and the home link; avoid explanatory captions.

### Geometry and materials

Model the gum as a thick ribbon with four drum openings, stretched bridges, pinned ends, and sparse dangling droplets. A connected balloon supplies the upper-right mass. Start gum roughness at 0.15, clearcoat at 0.8, and approximate translucency. Drums have pale enamel roughness 0.32; pins have metallic roughness 0.23. Prints have paper grain and modeled curled corners; keep real content flat and legible.

Author the connected aperture silhouette and pin joins; four separate rounded cards are insufficient. Use a neutral studio strip reflection and art-only corner layers/normal detail. Preserve rigid exclusion regions around clock faces and flat screenshot centers. No gum deformation may distort live numbers or archive artwork.

### Camera and lighting

The visual reference suggests shallow perspective, approximately 35 mm equivalent. The implementation contract uses an **orthographic** material stage with vertical half-span 5.5 desktop / 6.6 phone so the physical apertures and independent DOM stay aligned; do not replace it with a perspective camera merely to copy the illustration. Balloon and title still cross frame boundaries. A broad upper-left key, soft hemisphere fill and rear-right strip rim reveal curvature through long rectangular bands from the neutral studio reflection. Recompute the ribbon's vertex normals whenever its vertices deform, including the final return to rest, so the gloss follows the material's actual shape. Contact shadows anchor paper and gum; highlights must not recolor preview content.

### Interaction contract

Follow gum tethers to hanging prints; native scrolling moves through the continuous composition. The entire flat photograph is a normal preview link, never a drag-to-open puzzle. Hover/focus lifts its curled corner and strengthens the paper shadow; keyboard focus stills adjacent gum. Activation opens the existing preview overlay, and modifier-click retains normal links.

Dragging unoccupied gum stretches nearby strands at most 32 px desktop / 20 px phone after a 6 px intent threshold. Touch vertical movement retains native scroll; a stationary tap gives one dimple without pointer capture. Balloon touch is decorative and cannot act as a second reset. Only confirmed Again requests update deadline, tally and success choreography. Pending compresses the button at most 3% and holds; it cannot inflate the balloon. Failure releases it and uses the reserved short status. Repeated successes retarget the existing deformation from its current state, never compound scale or add strands.

The single crown sits beneath one clock-adjacent curl with a tiny metallic edge visible at rest. A real 44 px semantic button opens the fold on focus/approach. Tap/Enter reveals Long may I count. inside the underside; another activation dismisses the phrase; focus departure closes only the physical fold. The discovery never controls archive or reset access.

### Motion choreography

Gum follows the pointer with 140–220 ms damping and 12 px maximum displacement; a glossy dimple supplies the cursor effect. On release, use one small overshoot then rest; never delay the native pointer. Paper responds more promptly than the viscous gum. Hovered prints rotate no more than 2° and lift 6 px in 180 ms; focus keeps their content rigid.

On confirmed reset, balloon expansion begins at 80 ms, peaks at 12% at 650 ms and relaxes to rest by 1800 ms. A tightening front travels from Again through the four drum bridges. Real digit reels spin for 1080 ms per digit with 45 ms column staggering, settling left to right in about 1.4 s overall. These are concurrent parts of one breath, not sequential page-blocking animations. A newer remotely observed count produces only a 2% breath over 450 ms. Rejection releases the button over 160 ms without inflation. No ongoing idle deformation is required; preserve a quiet readable resting still life.

### Effects and render budget

Use one moderately tessellated gum mesh, simple vertex deformation, and instanced droplets. Limit the scene to roughly 70 draw calls and cap DPR at 1.5. Prefer approximate reflection and translucency over refraction passes. Target 60 fps desktop and 30 fps phone. Render during pointer activity, scroll, and short settling windows; pause hidden or offscreen animation.

### Responsive and fallback behavior

On phone, rotate the strip horizontally, reduce balloon cropping, and keep drums on one line. Prints descend along one loose tether; avoid blocked tap areas and keep 44 px targets. Reduced motion shows immediate real values and removes stretch, wobble, and cursor dimples. Mint background and static pink framing preserve DOM interactions without WebGL.

At 320 px, shrink or crop the decorative title before compromising timer or first photograph size. Native vertical scroll must work from gum and paper. The curl secret remains keyboard/touch accessible without drag. The static fallback needs shaped pink aperture framing, mint field and art-only paper corners, not a pink gradient above ordinary shelves.

### Implementation boundaries

Use the static generator, shared API, reels, and vendored Three.js; no framework or build step. The reference is an illustration guide, not an interactive asset. Raster elements may provide paper or background accents only. Keep clock, controls, tally, and real archive previews as accessible DOM elements; no canvas-only navigation or altered archived designs.

### Fidelity checks

Match the diagonal strip, cropped upper-right bubble, pale drums, lower-left title, and curling prints as one connected composition. Keep gloss from obscuring values. Test touch, keyboard, preview closing, reduced motion, and rejected reset behavior before declaring the concept faithful.

From a fresh visit, the first print opens with one ordinary activation and Again has a visible inset/press affordance. Observe pending, success, a second success during settling, rejection and remote update. Confirm that bubble size returns to its bounded resting silhouette, gum never distorts real content, touch scrolling stays native and the one crown has an equivalent focus/tap discovery.
