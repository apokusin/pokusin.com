# Tomorrow’s Roadworks

Read the [shared guide](../GUIDE.md), [contract](../../../countdowns/concepts/CONTRACT.md) and [art review](../reports/tomorrows-roadworks.md). This revision supersedes the initial material acceptance: the earlier foreground was a blockout against a richly detailed background. Numerical values below are an implemented starting recipe; rendered acceptance and hardware profiling are separate.

![Tomorrow’s Roadworks reference](../references/tomorrows-roadworks.jpg)

### Premise

Tomorrow remains under construction. Pressing Again prolongs one shared countdown; a heavy highway roll feeds a short new segment into a road that is already absurdly overbuilt. The archive is a roadside exhibition inside the construction diorama.

### Art style and composition

The reference is a crafted miniature, with a dusty salmon coast, blue granular highway, precast pink concrete, orange steel and warm theatrical work lamps. Keep a dominant raised clock at upper left, its orange action pillar immediately right, a foreground bend cropped at lower left, ascending road loops at right and a cable-held roll above them. Three supported billboards occupy unequal depths. Detail must explain construction rather than become random miniature clutter: truss triangles support screens, collars connect posts, cylindrical piers support the highway, and seams identify cast panels. The art-only coastline remains a distant layer; all manipulable and foreground construction is real geometry. Never bake the reference into the scene.

### Palette and typography

Cobalt `#2356A6`, pink precast `#D9AD94`, orange enamel `#EE711D`, caution lime `#CED538`, warm black `#191916`. Two fonts only: Barlow Condensed for industrial numerals, station names, dimensional title and sparse navigation; Libre Baskerville for Again and the hidden line. Remove the thick dashboard-like clock surround from the live DOM layer while graphics are active: the cast enclosure and black enamel face supply the physical boundary. D/H/M/S, names, tally and Again are the useful labels.

### Geometry and materials

Concrete uses a 512² deterministic surface with fine sand, isolated pores, cement laitance and faint cast seams; warm albedo, roughness .87, bump .024 scene units. Road aggregate is distinct: cobalt crushed flecks at .5–3.6 texture pixels, roughness .79, bump .027; provide continuous distance UVs along each ribbon so aggregate never stretches into a smooth gradient. Road has a dark lower slab and visible .13-unit granular edges, white painted center dashes and twin guardrails. Orange powder coat is roughness .39 with minute pitting and restrained clear coat; rubber is near-black, roughness .94 with diagonal tread relief; galvanized structural steel is roughness .36, metalness .78 and real environmental reflections. Work lamps have a curved black hood, a warm interior disc and a local light pool on the black face. Their brackets, panel bolts, ridge seams, truss diagonals, base shoes and rolled-layer rings remain visible at rest. Construction detail must not intersect real preview regions.

### Camera and lighting

Orthographic desktop vertical half-span `max(5.75,9.2×stageHeight/stageWidth)`, target `(0,2,0)`, position `(0,8.7,23)`. Keep the large upper-left clock and protected 18.4-unit horizontal field at tablet widths. Warm ivory key at `(-8,14,9)`, intensity 2.9, cool hemisphere .58, rear-right cool rim .45; key/fill/rim approximately 1:.20:.16. Prefilter a simple sky/warm-ground environment once; orange and steel reflect it, concrete remains matte. One PCF soft shadow caster: 2048 desktop / 1024 phone, tight 28-unit bounds, normal bias .035. Concrete recesses, wheel/foot contacts and piers receive restrained authored contact darkness, never a dirty full-screen vignette. The art-only coast stays atmospheric; do not flatten foreground light with a strong ambient fill.

### Interaction contract

Native vertical scrolling follows a blue route through named stations; real show anchors remain visible and open faithful preserved pages through the shared preview. Hover/focus can brighten a lamp, but preview targets remain still. Close restores exact scroll and focus; modifiers and middle click retain true URLs. Only Again requests shared reset. Pending compresses the physical cap without adding road; errors release it with the real short status. Roll manipulation starts on its visible geometry, affects only the sculpture and clears on cancel, blur, hidden page or opening a preview. The roll’s underside contains exactly one crown; its keyboard/touch equivalent reveals Long may I count.

### Motion choreography

Real changed-digit reels use 420 ms. Confirmed reset uses shared 1080 ms spins with 45 ms column delays. After 140 ms, the already attached ribbon flexes and feeds for 1.76 s; no disconnected confetti or unlimited geometry growth. The roll rotates with the strip; after 1.8 s one truck moves along the settled route for 2.2 s, then disappears behind authored structure. Motion is bounded and reused. Remote observations cause a brief lamp warm-up, not the entire ceremony. Lamp intensity rests, pointer light cues settle over approximately 120 ms, and ornamental trucks remain parked. No automatic scroll or endless site-construction loop.

### Effects and render budget

Use one shared renderer, fixed road/ribbon buffers, instanced lane marks and posts, fixed construction props, one shadow light and one PMREM environment. Proposed ceiling 130 draw calls / 110k triangles; actual root profiling is required before claiming 60/30 fps. DPR stays capped by the shared runtime. Avoid bloom, screen-space fog, full-scene blur, neon edge outlines and continuous particle systems. Reflection/material resources dispose with the selected theme.

### Responsive and fallback behavior

Below 700 px recompose the road into a vertical serpentine with the large real clock and action before three supported billboards. Clock occupies a 7.3-unit horizontal field; derive vertical span from stage aspect rather than shrinking desktop. Piers/truss mounts follow the mobile object positions; clear space around Again and tally has priority. All hit targets remain at least 44 px, including the crown. Reduced motion stops ribbon/crane/vehicle movement and immediately updates real values. Without WebGL the art-only coastline and textured DOM industrial panels retain clock, Again, count, station links and all previews. No blank canvas or disabled archive.

### Implementation boundaries

Keep static files and vendored Three.js. `engineered-materials.js` supplies local procedural surfaces and prefiltered environments shared only by the two engineered concepts. It does not supply a generic lighting preset: each installation configures its own key/fill/rim and palettes. No framework, package manifest, physics service or alternative timer. Closed billboards use faithful captures; opened screens use actual preserved pages. Generated output is never edited directly.

### Fidelity checks

Reject smooth toy blocks, unsupported giant displays, evenly scattered round rocks, paper-thin roads, strong flat ambient light and CSS-painted fake chrome. Compare actual desktop, 390 px and 320 px views against the reference at rest and during confirmed reset. Inspect concrete pores, road aggregate, lamp pools, supported billboard depth, thick slab, legible live digits and the attached roll. Validate real reset/tally, errors, keyboard/new-tab/preview restoration, reduced motion and graphics loss separately. Current visual acceptance remains pending actual revised screenshots.
