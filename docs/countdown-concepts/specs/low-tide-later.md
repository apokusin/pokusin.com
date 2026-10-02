# Low Tide, Later

New exploration 2; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Low Tide, Later visual reference](../references/low-tide-later.jpg)

Art direction reviewed against the actual visual; see the [individual report](../reports/low-tide-later.md). The recommendations below are part of the implementation brief.

### Premise

The next countdown is about to emerge from a retreating tide. Again brings the water back, making tomorrow wait offshore. The shoreline organizes the archive and interaction; it is not a decorative ocean behind ordinary gallery cards. Shared state remains independent of the decorative tide height.

### Art style and composition

Preserve the strong diagonal division: deep blue water upper-left, chalk-white tidal bed right, four irregular chalk cylinders emerging through water, and scattered photographic archive sheets. Keep the shell button on dry ground. Continue a meandering shore through the archive; use uneven spacing and paper rotation without obscuring preview contents.

Unlike the illustrative reference, flat screenshot centers and every title remain optically dry. Wet paper edges and cast shadows carry the water effect. No photograph needs to be fished out or peeled before opening. The shell has a shallow inset Again face, a clear contact shadow and a small physical press affordance. The tally sits beside it on dry ground; omit the generated share symbol.


The implemented material plate uses orthographic half-span 5.5 and independent dry DOM. The upper-right Severance mount is left 67%, top 6%, width 26%, clearing the seconds cylinder. Desktop live-scene digits have no square backing: textured chalk provides their surface. At widths below 700 px, two repositioned stone pairs receive small rounded, translucent chalk backings to guarantee readable contrast; this is an accepted phone exception, not a desktop tile treatment. Shell and crown move into the viewport; fallback adds chalk-shaped DOM framing.

### Palette and typography

Cyanotype blue `#123CA6`, paper `#E8F1EC`, water highlight `#729ED0`, shell rust `#C76239`. The implemented pair is Georgia for clock, Again and show labels, plus Arial for navigation/status. Remove decorative marine prose. Keep title, identity, show/version labels, D/H/M/S, real tally, and a small navigable show index.

### Geometry and materials

One shallow displaced water plane follows an authored shoreline mask. Chalk cylinders have chipped silhouettes, granular normal maps, roughness about 0.85, and painted tide stains. Paper uses bent planes with thickened edges; avoid simulated cloth. Shell ridges are real low-poly geometry supplemented by a normal map. Archived screenshots occupy flat DOM surfaces aligned to dry paper centers.

Author separate shoreline/exclusion masks for live digits, shell, tally, labels and screenshot centers. Water may wrap each cylinder base below 30% of its visible height. After a success, a thin blue contact stain remains at the same authored base, not at an incrementally higher water level. Supply art-only salt, paper and seaweed detail without invented content or labels.

### Camera and lighting

Use a near-orthographic overhead camera tilted about 20 degrees from vertical. Key/fill/rim around 1:0.35:0.08: broad high daylight, cool sky fill, minimal edge reflection. Water uses a Fresnel term, two scrolling normal layers, and a depth tint. Project restrained caustics onto chalk using two animated textures; baked AO anchors sheets and cylinders.

### Interaction contract

Pointer or a stationary touch creates one damped ripple near water; paper corners respond only within a small radius. Never capture vertical touch scrolling or make a swipe leave a ripple trail. The entire flat photograph is a normal preview link. Focus stills its paper and clears incidental sheen over its center. Show-index activation follows the shore using ordinary anchors; do not add a tide control, map legend or scroll mode.

Pending Again depresses the shell 2 px with a small glint but keeps water fixed. Only POST success sends an incoming wave. Repeated successes retarget the same bounded front; errors release the shell with no wave and use the reserved short status. A newly observed remote count produces one small tide-edge ripple, never the local flood ceremony.

The one crown is chipped **matte chalk**, resting in a small blue tide pool beside the shell. It shares the stones' granular diffuse/bump material and has irregular points and band edges; do not substitute metallic gold tines. Hover/focus on its real 44 px target immediately quiets incidental water detail nearby and reduces the pool's blue veil from 23% to 7% opacity, enough to make the rough crown clearer. Keyboard focus remains active if the pointer leaves. Tap/Enter reveals “Long may I count.” as a brief note beside that pool. Discovery never requires wave timing, water dragging or successful resets.

### Motion choreography

Idle currents drift slowly in opposing directions with broad, low movement. Caustics never flicker across the timer. Normal digit reels take 420 ms; successful reset reels use 1080 ms per digit and 45 ms column staggering, about 1.4 s overall with left-to-right settling.

Concurrently, one broad successful front approaches from the upper-left for 450 ms, briefly curls around cylinder bases, and eases back over 1150 ms. It never crosses the authored dry exclusion regions. Repeats reuse the same front and cannot raise the resting tide. Ripples are elliptical in the camera view, have one restrained crest, and decay under 900 ms; pointer samples are at least 120 ms apart with eight concurrent ripples maximum. A remote event enqueues exactly one small edge ripple independently of this pointer sample gate, so a moving mouse cannot starve it; an open preview defers it until the scene resumes. Paper settles, stills on focus/preview, and never bobs endlessly. No obligatory camera travel.

### Effects and render budget

Start below 80k visible triangles, 60 draw calls, and eight concurrent ripple uniforms. Avoid screen-space reflections and full fluid simulation. Cap DPR at 1.5 desktop/1 mobile; use 1K water normal maps and 2K paper detail. Target 60/30 fps desktop/mobile. Reduce caustic layers first; suspend all decorative work offscreen or while hidden.

### Responsive and fallback behavior

Mobile turns the shore into a vertical diagonal, keeps timer cylinders in two pairs, and places the shell above the first archive sheet. Sheets remain large enough to recognize and select. Coarse pointers use tap ripples. Reduced motion freezes water and caustics, updates values immediately, and preserves dry navigation. Static fallback combines art-only shoreline texture with real DOM controls and previews.

A tap ripple is optional feedback, not a required gesture. Vertical swipes retain ordinary scroll from paper or water. Keep the rust action and dry tally readable above the first sheet at 320 px; preserve the white/blue diagonal in the fallback. The one crown has the same focus/tap path as desktop. The expired-countdown note belongs to the action's normal flex flow after its status, so it cannot overlap Again, the tally or a revealed crown note.

### Implementation boundaries

Static generated markup plus vendored Three.js; no React build required. Preserve archive data and preview rules. Do not use invented show imagery from the mock or fake a share feature suggested by its icon. Implement only the tide-pool crown described above. Decorative tide height never becomes a separate counter or stored deadline.

### Fidelity checks

The diagonal white/blue composition, chalk cylinders, rust shell, and salt-worn photographs must survive small-screen adaptation. Avoid a resort beach, glass spheres, generic underwater bubbles, or a grid below the scene. Verify sheet readability, tide masking, countdown truth, success-only waves, index focus, reduced motion, and static archive access.

One success must visibly return the sea while every target stays dry. Test the maximum wet line, screenshot contrast, native touch scroll, full-photo activation, repeat/remote/rejected resets, still focused paper, accessible crown discovery, preview focus restoration, and the art-only fallback.
