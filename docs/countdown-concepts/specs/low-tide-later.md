# Low Tide, Later

New exploration 2; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Low Tide, Later visual reference](../references/low-tide-later.jpg)

### Premise

The next countdown is about to emerge from a retreating tide. Again brings the water back, making tomorrow wait offshore. The shoreline organizes the archive and interaction; it is not a decorative ocean behind ordinary gallery cards. Shared state remains independent of the decorative tide height.

### Art style and composition

Preserve the strong diagonal division: deep blue water upper-left, chalk-white tidal bed right, four irregular chalk cylinders emerging through water, and scattered photographic archive sheets. Keep the shell button on dry ground. Continue a meandering shore through the archive; use uneven spacing and paper rotation without obscuring preview contents.

### Palette and typography

Cyanotype blue `#123CA6`, paper `#E8F1EC`, water highlight `#729ED0`, shell rust `#C76239`. Use Libre Baskerville for clock and Again; system sans for navigation and small show labels. Remove decorative marine prose. Keep title, identity, show/version labels, D/H/M/S, real tally, and a small navigable show index.

### Geometry and materials

One shallow displaced water plane follows an authored shoreline mask. Chalk cylinders have chipped silhouettes, granular normal maps, roughness about 0.85, and painted tide stains. Paper uses bent planes with thickened edges; avoid simulated cloth. Shell ridges are real low-poly geometry supplemented by a normal map. Archived screenshots occupy flat DOM surfaces aligned to dry paper centers.

### Camera and lighting

Use a near-orthographic overhead camera tilted about 20 degrees from vertical. Key/fill/rim around 1:0.35:0.08: broad high daylight, cool sky fill, minimal edge reflection. Water uses a Fresnel term, two scrolling normal layers, and a depth tint. Project restrained caustics onto chalk using two animated textures; baked AO anchors sheets and cylinders.

### Interaction contract

Pointer or touch creates damped intersecting ripples near water; paper corners respond only within a small radius. Show-index activation follows the shore to the relevant group using ordinary anchors, without capturing normal scrolling. Preview clicks retain the existing overlay. Again presses the shell; pending state adds a small glint. Only POST success sends an incoming wave. Errors produce no flood; remote updates add one modest ripple.

### Motion choreography

Idle currents drift slowly in opposing directions. Normal digit reels take 420 ms; successful reset reels use 1080 ms per digit and 45 ms column staggering, about 1.4 s overall with left-to-right settling. The successful wave advances over roughly 1600 ms, curls around cylinders, then recedes from actual controls. Preserve legibility throughout. Ripple response lasts under 900 ms; paper settles without endless bobbing. No obligatory camera travel.

### Effects and render budget

Start below 80k visible triangles, 60 draw calls, and eight concurrent ripple uniforms. Avoid screen-space reflections and full fluid simulation. Cap DPR at 1.5 desktop/1 mobile; use 1K water normal maps and 2K paper detail. Target 60/30 fps desktop/mobile. Reduce caustic layers first; suspend all decorative work offscreen or while hidden.

### Responsive and fallback behavior

Mobile turns the shore into a vertical diagonal, keeps timer cylinders in two pairs, and places the shell above the first archive sheet. Sheets remain large enough to recognize and select. Coarse pointers use tap ripples. Reduced motion freezes water and caustics, updates values immediately, and preserves dry navigation. Static fallback combines art-only shoreline texture with real DOM controls and previews.

### Implementation boundaries

Static generated markup plus vendored Three.js; no React build required. Preserve archive data and preview rules. Do not use invented show imagery from the mock or fake a share feature suggested by its icon. Hide the single crown as a small tide-pool object; its activation reveals Long may I count.

### Fidelity checks

The diagonal white/blue composition, chalk cylinders, rust shell, and salt-worn photographs must survive small-screen adaptation. Avoid a resort beach, glass spheres, generic underwater bubbles, or a grid below the scene. Verify sheet readability, tide masking, countdown truth, success-only waves, index focus, reduced motion, and static archive access.
