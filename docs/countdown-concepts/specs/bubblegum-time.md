# Bubblegum Time

Retained reference from the previous exploration round; not numbered in the new round.

Read the [shared implementation guide](../GUIDE.md) with this spec. This revision supersedes the initial shallow material pass. Numerical settings are exact starting recipes to tune against actual desktop and phone renders; acceptance remains pending fresh browser review.

![Bubblegum Time visual reference](../references/bubblegum-time.jpg)

Art direction reviewed against the actual visual; see the [individual report](../reports/bubblegum-time.md). The recommendations below are part of the implementation brief.

### Premise

A single stretched pink membrane holds an absurdly serious four-drum clock. Paper archives are caught on its edges; the enormous bubble is the same material, stretched thin. The image is an editorial studio still life, not a toy UI.

### Art style and composition

Preserve the mint field, glossy pink diagonal clock strip, four pale mechanical drums, and enormous bubble cropped beyond the upper-right edge. A large Severance print hangs upper left; smaller prints punctuate opposite corners. Cropped black “Countdowns” lettering sweeps across the lower-left edge. Preserve this asymmetric editorial still life; avoid a centered blob above shelves.

Keep still, mint breathing space around the first working photograph. Metal pins and matte paper provide contrast with the glossy gum. A photograph should appear selectable before any gesture is discovered: flat image, small cast shadow, lifted corner and readable caption. Cropping applies to balloon/title, never to live digits or a paper target.


Framing uses an orthographic half-span 5.5 and projected drum-centre anchors for exact alignment of the real DOM with the connected 3D belt. Phone uses half-span 6.6, a narrower X silhouette (0.37 scale, 0.34 below 361 px) and 0.51 Y/Z scale, with the drum glyphs recomposed into one legible row; lower photographs start at 55% and 72% of the 1050 px hero, leaving their captions readable. Cropped title yields to these targets.

The archive is a descending studio installation. Alternate large isolated paper prints and paired smaller prints along stretched gum ribs; use substantial mint gaps, pressure shadows and uneven attachment points. Show names are quiet ink on paper, never a repeated heading row above a neat grid. The hero’s black diagonal title is the only oversized typography. The Worlds/Home controls remain small real links. Keep native scroll: the visual world continues rather than ending at a hero boundary.

### Palette and typography

Use pale mint #D6EAC9, candy pink #F372AC, highlight pink #FFC2DC, cream #F1EBD8, and ink #10120F. Use Georgia for the editorial title/show captions and Arial at heavy weight with tabular digits for the clock; use Arial for small navigation/status. Labels are “Again,” D/H/M/S, show names, optional season notation, and the home link; avoid explanatory captions.

### Geometry and materials

The gum has two optical scales. Its broad shape is a rounded, connected four-aperture membrane with stretched lobes at the pin joins. Its close surface has shallow longitudinal pull lines and isolated compressed wrinkles around apertures; no blanket random displacement. A 256 px repeat bump/roughness texture adds fine stretched imperfections: bump 0.026 world units, base roughness 0.20 varying 0.16–0.29. Clearcoat 0.95 / clearcoat roughness 0.10, IOR 1.42, thin pink transmission 0.12 with thickness 0.65. The balloon uses the same skin with 0.20 transmission, thickness 0.32, brighter attenuation and roughness 0.15; its lower neck folds gather into the membrane. Keep its centre at z=−2.8 so its front remains behind the drums even at the 12% breath peak. The neck starts above and to the right of the seconds aperture, never through its reading face; all four full cream faces and their centred true units must remain exposed. Neither surface is metal. Model a few stretched fold ridges as tapering tubes along the aperture edges and pin joins, with their roots flush to the membrane. Sparse translucent droplets use the same material, not floating opaque balls.

Drums are actual independent cream enamel cylinders on a horizontal axle, recessed into the four apertures, with satin-steel end rings and a narrow mechanical central seam; real DOM reel glyphs remain rigid and project to the drum centres. Healthy graphics remove the earlier CSS gradient tiles. Graphics loss restores the illustrated DOM drum surfaces. Pins are turned satin steel, metalness 0.92 / roughness 0.24 with a wider edge glint. Paper is warm cotton stock: a repeat 192 px fibre/grain layer, base roughness 0.93 and visible edge thickness. Every hero print has a curved underside and a larger folded corner made from a segmented surface; the screenshot centre stays flat. Archive prints continue this same paper, pressure marks and curl language. No invented images or tinted screenshots.

### Camera and lighting

Keep the existing orthographic half-span 5.5 desktop / 6.6 phone, looking straight along −Z. The whole-page mint field is a studio sweep, with a receiving plane at z=−2.8 that grounds gum and paper. Use one shadow-casting warm white key from (−5,8,10), strength 3.0; cool mint fill 0.70; rear-right pink rim 1.15. ACES exposure starts at 1.02 and must be tuned against cream drums rather than clipping highlights.

Build a PMREM studio environment from a 512×256 equirectangular map: one tall white softbox at front-left, a wide overhead strip and a smaller rose bounce at right; black gaps between these sources are essential. Environment intensity 1.35 gum / 1.20 balloon. Reflections should describe the long folds as broad white bands, with a small sharper steel highlight. A single 2048 desktop / 1024 phone variance shadow map receives on the mint sweep; tight ±12 bounds, blur radius 6 with 10 samples, normal bias 0.03. Limit the receiver to 16% density so the soft studio shadow never reads as a second graphic object. Additional bounded radial contact shading anchors the gum neck and paper attachments. Avoid rainbow iridescence, bloom, chromatic aberration, default vignette or a chalky flat pink fill.

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
