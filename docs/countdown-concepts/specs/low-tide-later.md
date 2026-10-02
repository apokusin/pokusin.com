# Low Tide, Later

Revised material direction, October 2, 2026. This supersedes the initial simple blue-plane acceptance. Read the [guide](../GUIDE.md), [report](../reports/low-tide-later.md) and actual reference together. Rendering settings are concrete starting recipes; frame-rate targets require actual device measurement.

![Low Tide, Later reference](../references/low-tide-later.jpg)

### Premise

Tomorrow is about to wash ashore. Again brings the tide back. The countdown stones and found archive photographs inhabit one cyanotype shoreline, with no explanation of the joke.

### Art style and composition

Preserve the strong deep-blue upper-left / chalk-white right diagonal. Four eroded chalk cylinders descend toward the right; rust scallop and small tally remain on dry ground. Three faithful photographs sit on curled paper beds at irregular intervals. The sea is a lit spatial surface with a clear wet edge, not a flat CSS wedge behind ordinary cards.

Screens and labels stay optically dry. Water/foam may meet paper edges but cannot veil real screenshots or require fishing out a print. The native archive continues along the white side of the wandering shore with separated, uneven photographic mounts. Do not use resort imagery, glass bubbles, generic underwater scenery, a dashboard or a tide-height control.

### Palette and typography

Deep cyanotype water starts near linear `(0.007,0.035,0.105)`; shallow water near `(0.032,0.135,0.23)`. Lit foam `#C2DBD6`, chalk `#ECE9D9`, shore `#E0E3D6`, marine ink `#113F73`, shell `#BE5634`, rib highlights `#DB8151`. Keep white paper distinct from cream chalk. Georgia owns numbers, Again and show labels; Arial owns navigation/status. Existing names, D/H/M/S, Again and actual count are sufficient.

### Geometry and materials

- Shore: a 120 × 84-segment shallow plane with broad 0.08-unit strata and 0.035-unit erosion detail. A 256² procedural granular map supplies diffuse-scale variation, roughness and actual bump. Repeat the shore maps 6 × 5, with pale microscopic pores and 220 tiny irregular instanced chalk grains **only on the dry side** of the authored edge; reject large dark square pixels.
- Chalk: four 64-sided, 18-height-segment cylinders, radius 0.85–0.93, height 2.30. Perturb radial contour with multiple low-amplitude erosion bands; chip top height by roughly 0.045 units. Keep continuous surfaces, no faceted toy blocks or regular zigzag teeth.
- Stain: derive wet blue from actual local stone height, smooth over 14–29% of its height with irregular flecks. It is a single material field, not an opaque horizontal band mesh. Tops remain dry and pale.
- Paper: 3.1 × 2.15-unit subdivided planes, softly lifted outer corners and slightly thick-looking edge shadows. Physical centers are flat; true image anchors sit above them. Roughness 0.94, bump 0.018. Never fake a page screenshot on a curved plane.
- Shell: real scalloped extrusion, 0.14-unit thickness and 23 raised curved radial ribs. Base roughness 0.46, clearcoat 0.28. Again sits directly over the physical ribs; a separate CSS button pill is prohibited while graphics work.
- Water: one 120 × 70-segment mesh displaced at 0.038-unit amplitude; a single authored diagonal mask plus an optional success-front offset. Every actual control sits on a dry independent face.

`liquid-materials.js` owns the deterministic 256² material maps and 128 × 64 HDR environment. Texture detail belongs to each material; never cover the viewport with noise.

### Camera and lighting

Use a near-orthographic frontal overhead relief projection, vertical half-span 5.5, at `(0,0,18)`. The cylinder geometry, dry paper and surface normals create depth without forcing unreadable perspective on true native digits. Avoid incidental camera sway.

Exposure begins at 1.04. Warm broad daylight key `#FFF9DF`, intensity 3.1, position `(-7,8,12)`; cool hemisphere `#B4D9F4/#5D778A`, intensity 0.8; cyan edge fill `#5AC6EE`, intensity 0.35, position `(4,-2,5)`. One 2048 desktop / 1024 phone shadow, radius 3, ±12 × ±8 bounds, normal bias 0.035. Reflection environment intensity is 0.55. Water has its own deliberate analytic daylight/reflection shader, matching the same warm key and cool sky direction.

### Interaction contract

Photographs remain native full-image preview links. The real clock units, shell action and tally project onto the physical stones/shell without duplicate values or stored tide state. Modifier/middle-click, Escape, common modal focus and exact close restoration remain intact. Ordinary native scroll is the archive route.

Pointer movement over water creates an occasional damped ripple. A phone tap qualifies only under 6 px travel and 400 ms; swipes retain scroll and never acquire pointer capture. Pending lowers the shell face without moving the tide. Successful shared POST alone produces an incoming wave; rejected requests return it unchanged. A remote observation produces one small edge ripple, independently of pointer sampling; observations while a preview is open coalesce into one deferred response.

The one crown is matte chalk in a shallow blue pool, with a 44 px native discovery target. Focus/hover reduces its blue veil from 23% to 7% and quiets nearby water detail. Focus persists when the pointer leaves. Click/Enter reveals **Long may I count.** beside it. No timing puzzle or successful reset is required.

### Motion choreography

Broad current phases drift at roughly 0.11–0.31 radians/second in opposing directions. Two normal scales use `36×27` and `166×140` UV fields with oblique, incommensurate directions. Three broad slope amplitudes are 0.13/0.095/0.045; fine amplitudes 0.014/0.012. Never use independent large Cartesian cosines: they produced the rejected checker pattern. Fine normals supply small glints rather than a second large wave. Mesh displacement remains 0.038 units. No endlessly bobbing paper or sweeping white screensaver streaks.

A successful front travels at most 0.050 UV units toward the dry side, peaks at 450 ms, then recedes over 1150 ms. Repeated successes retarget the same front; they never cumulatively raise water. Existing numerical reels retain 420 ms ticks and reset spins of 1080 ms plus 45 ms column stagger. Eight ripple slots, at least 120 ms pointer sample spacing, one crest, 900 ms maximum life; remote ripple amplitude 0.35 of a local one. Freeze choreography during preview.

### Effects and render budget

Water combines finite wave-derived normals, Fresnel reflection, a broad procedural cloud reflection, depth tint, narrow analytic sun glints and restrained shallow caustic lines. Reflection uses normal/view direction and broad marine-tinted cloud structure, not arbitrary blue noise. The flattened cyanotype treatment exaggerates Fresnel to 0.12 + 0.42 × (1 − N·V)² and uses a low-contrast curved optical-depth field from the same wave phases; do not call it a physically exact ocean. Caustics use powers 18/12 at reduced 0.045/0.105/0.13 linear tint so they form longer restrained veins rather than broad paint swirls; they stay off glyphs and photo centers. The shoreline foam has a narrow distance falloff with broken granular patches. No screen-space reflection, fluid simulation, full-scene bloom, lens effects or particle spray.

Keep one shadowed light and one water pass. Reuse eight ripple uniforms, paper geometry and instanced dry grit. PMREM is made once and explicitly disposed. The shared runtime disposes visible geometry/material/texture resources. Suspend work offscreen, hidden or in preview; lower fine caustic detail before sacrificing silhouettes if profiling demands it.

### Responsive and fallback behavior

At 390 and 320 px, recompose four stones into two physical pairs at 61% scale; paper beds use 68% scale and large recognizable screenshots. Scale native projection widths together with mesh scale. Keep the rust shell and real tally dry above the first lower photograph. No tiny digit under a stone or giant detached number below it. All native targets remain at least 44 px.

Reduced motion fixes wave/normal/caustic phases, removes incoming surge and ripples, and updates native reels immediately. Graphics loss removes pins and restores the diagonal illustrated DOM composition with chalk-shaped contrast backings, true controls and every archive link. Expired/status/secret notes must remain in normal action flow without overlap. True desktop and phone scene digits have no independent square backing.

### Implementation boundaries

Static site with vendored Three.js. Preserve shared API/reels, archive destinations, actual faithful captures and common preview. No React build, new service, fictitious share control, fluid backend, accumulating water state or duplicate counter.

### Fidelity checks

Compare actual desktop, 390 and 320 frames with the reference. Require deep cyanotype water, tactile granular chalk, a credible wet stain, foam meeting the bed, cast paper shadows and an identifiable physical shell. Reject a flat CSS sea, smooth toy columns, square contrast tiles, detached DOM digits, regular pill button or all-over grain. Verify one real success frame, stable rest after repeats, remote response, rejected/pending states, native touch scroll, full-photo preview/focus return, crown, reduced motion and WebGL loss. Renewed visual acceptance and actual runtime evidence are recorded in the individual report and shared QA.
