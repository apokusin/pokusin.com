# Tomorrow's Roadworks

**Status: authored scene-first candidate implemented; original-reference art gate pending.** The earlier non-Fair implementation was rejected and its acceptance remains withdrawn. The original image still controls composition/material judgment. See the [current art-director report](../reports/tomorrows-roadworks.md), [implemented runtime audit](../runtime-audit.md) and [saved rebuilt evidence](../architecture/evidence/rebuilt/README.md). The Fair remains unchanged.

### Premise

Tomorrow is perpetually under construction. Again restarts the shared countdown while a crane feeds road into an absurd longer detour. The archive is a roadside exhibition across a crafted miniature coast.

### Art style and composition

Match the source's coherent scale and dense continuous route: cobalt road enters lower-left, makes a foreground S-bend, crosses below/behind the upper-left clock and rises through two large loops at right. Seven unequal roadside stations follow it. Substantial concrete clock on blue pipe legs, separate deep orange action pillar and three lit curved work lamps upper-left; crane/harness/roll behind the action upper-middle. Salmon quarry stacks, piers, trusses and meaningful machinery share actual 3D ground. No photographic foreground hiding toy geometry, giant upright HTML preview panels or gallery below the miniature.

### Palette and typography

Cobalt `#2356A6`, salmon cast stone `#D9AD94`, orange enamel `#EE711D`, caution lime `#CED538`, warm black `#191916`. At most two families: source-matched tall industrial numerals/station names and restrained serif Again/hidden line. Real numerical/tally textures belong on physical sign/action surfaces. Names, D/H/M/S, Again and actual link labels suffice; omit invented slogans/instruction blocks.

### Geometry and materials

**Implemented candidate.** A real miniature quarry, elevated cobalt road, modeled concrete supports, timer board, crane/road spool, enamel action and individual billboard surfaces now occupy one scene. The road rail includes the opening plus all thirteen genuine works; actual More/timeline/live links are bound to physical destinations. Authored rock/coast silhouettes, road thickness, pier geometry and machinery export from Blender. Distinct mapped concrete aggregate, asphalt/paint wear and stone relief replace the earlier shared hero. Runtime daylight and lamp/reflection sources illuminate the installation; reference scenery is not used as its background.

Follow the selected [Blender 4.5.14 LTS asset workflow](../architecture/assets.md), [composition/type anchors](../architecture/composition.md), [input ownership](../architecture/input.md) and [physical inventory](../architecture/INVENTORY.md). Editable Blender sources, reproducible Python exporters, static GLB bundles, named-node manifests and material maps now exist under the concept’s scene directory. They are implemented candidates; a successful export does not pass the original-reference art gate.

Author volumetric coast/quarry, continuous thick road/slabs, piers, cast sign bodies, trusses, crane, recognisable modeled machinery and rail/pipe kit. Deliver optimized `.glb`, editable source/reproducible authoring scripts, UVs, separate albedo/roughness/normal/AO maps and scale/material manifest. The pinned Blender 4.5.14 LTS runtime has been used for these authored exports. Offline assets do not add a site build.

Limestone sculpted strata/broken ledges precede pores; precast faces have finer sand, seams and worn bevels. Highway has exposed slab edges, continuous distance UVs, cobalt aggregate, physical lane paint/guardrails/joints. Supports meet actual terrain/road. Crane lattice and roll harness connect. Orange enamel highlights differ from matte treaded tires/steel rails. Eight-box vehicles are blockouts only. Vegetation grows in selected cracks. Clock/lamps and rounded deep cap are actual parts; no CSS borders or paper-thin road substitute.

### Camera and lighting

**Current source gate.** Keep the warm low quarry key distinct from cool water/sky fill. Raking light should reveal eroded strata and aggregate without uniformly brown piers. Cobalt edges need reflected sky, while enamel gets a localized convex highlight; a single flat blue field is insufficient.

Choose long-lens perspective or tilted orthographic projection by matching source near/far scale, then use a composed overview and authored road-parallel camera spline. Warm upper-left afternoon key, pale blue sky bounce and three local work-lamp pools share one exposure. Tight shadows/contact AO establish supports, machinery and rubble. Subtle far haze or optional DOF affects distant noninteractive coast only; approached work stays sharp. No full-screen bloom or detailed image layer concealing a weak foreground.

### Interaction contract

The new scene uses the shared lifecycle/action host without inheriting a shared visual composition. Fourteen exact scroll stops cover the opening and all thirteen genuine versions. Five archive-page links, the Dexter timeline and external live Severance destination retain native href/target/rel semantics; keyboard focus synchronizes the requested surface and runway. Home, Worlds and Clock stay independently accessible.

Native wheel/trackpad and vertical touch scrolling use the bounded runway to follow the blue route. Visible numbered stones/native show links select the same stops directly. Empty-ground pointer movement creates only the local dust trace; it never pans the route. Seven stations contain all 13 gallery works as real leading and hinged/fanning version billboards, with visible second edges. Image activation approaches its angled screen and opens the preserved page; close restores exact road/camera/focus. True modifier/middle-click URLs remain.

Five More/archive links—GoT, Dexter, Sherlock, Archer, Breaking Bad—are small station sign flaps linking to existing archive pages with theme preserved. Dexter's separate route-strip sign opens the actual episode scrubber. Severance's outward-arrow sign opens its actual live site; LIVE remains only on its live work. Home/Worlds are sparse physical/native equivalents. Deliberate mesh hit regions mirror native controls; keyboard focus frames the matching station/sign. Real iframe fits an approached aperture or existing readable modal.

Again holds compressed pending pressure; error/429 releases it with existing real status and no road event. A deliberate roll/ribbon lift flexes connected geometry without resetting time. Its underside hides the sole crown; native lift/reveal equivalents expose Long may I count. Cancellation, blur, preview and hidden page clear grabs.

### Motion choreography

**Implemented motion contract.** The owned rail frames each billboard independently. Pending board/action pressure and the confirmed road-spool/route ceremony remain separate; scene motion freezes during previews/hidden time, and reduced motion assigns the final mechanical state directly. Repeated presses reuse bounded geometry rather than extend the world indefinitely.

Mirror existing reels: changed digits 420 ms, resets 1080 ms/45 ms staggering. Confirmed success turns the layered roll, feeds a finite connected road slab, telescopes temporary supports and sends one modeled truck across before parking behind structure. A bounded route morph/hidden return segment makes the detour longer without unlimited growth. All motion shares cable/material mass. No feed/tally change before API success. Remote reset only warms a work lamp and twitches the harness; props otherwise rest. No autonomous scroll or endless construction loop.

### Effects and render budget

One renderer/main shadow light, bounded road buffers, instanced rails/lane/plant components and reused vehicle assets. Profile LOD/map/draw-call budgets after the faithful silhouette gate; settings do not establish hardware FPS. Reduce distant secondary props/optional DOF before losing foreground thickness/contact. No growing world, physics server, confetti or cursor fountain. Pause hidden and dispose assets/listeners when leaving.

### Responsive and fallback behavior

**Portrait candidate.** A separate portrait camera/rail is implemented. Its latest rebuilt export requires a new actual 390/320 opening and full-route capture; the earlier source review does not certify that portrait composition. The host recreates the authored profile when crossing 700px without a page reload, preserving native/shared state and normalized archive position; it defers that recreation until an open preview closes. Failure reveals the complete semantic/native archive.

Phone frames large clock/action, foreground road entry and one exposed station with route receding upward. Follow the same route or select numbered stones directly; recompose route/camera/supports at 390/320 px instead of a vertical flat-card feed. Approached work stays readable and actions 44 px. Reduced motion skips travel/feed/vehicle/ribbon and applies true numbers immediately. Graphics/import/asset failure restores illustrated native archive/actions and all accessory links, never a blank terrain or disabled work.

### Implementation boundaries

The active opt-in module is `countdowns/concepts/tomorrows-roadworks.scene.js`, with authored files under `countdowns/assets/concepts/tomorrows-roadworks/scene/`. `scene-host.js`, `scene-surfaces.js` and `scene-gallery.js` share lifecycle, picking, native actions and dynamic surface values only. Legacy module/style files remain fallback/historical material. No site build or backend change is introduced.

Static vendored Three/modules/authored assets; no framework/site build/new backend. Keep API/month semantics/isolation/limiter, reels, true SHOWS/URLs, preserved pages and Fair intact. Shared adapter supplies complete content/link/state; concept owns route/composition. No mandatory three mounts or healthy HTML shelves. Foreground terrain is geometry; sky/distant atmosphere can be raster art. Optional microtextures cannot blacken coherent base surfaces.

### Fidelity checks

**Current art-director finding.** The current desktop has a continuous supported cobalt route, readable board, crane/spool, billboard hierarchy and materially denser terrain than the earlier flat candidate. It still uses broadly uniform beige ground and large angular rocks; the source has finer eroded strata, richer low sunlight and more differentiated worn machinery/enamel. The repaired 390/320 opening now fills the portrait with the quarry/road, all four readable clock units and Again, instead of shrinking the entire installation into an empty middle strip. The first GoT and Severance billboards sit along the visible route. The distant 320 capture establishes travel to the actual Severance tracker and a visible Clock return. These are observed composition improvements, not final equivalence to the original artwork. The latest portrait rig supersedes the failed undersized frame, which remains in the evidence history. Root browser checks confirmed one physical 390 reset (405→406), a physical 320 GoT billboard opening genuine Season 4, Escape restoring native GoT focus/unloading the iframe/scroll 0, and End travel to the distant Severance tracker with Clock returning to opening 0. The final offline rerun covers the newly saved Road source and both model profiles. The quarry, raking-light, convex enamel and source-level machinery/material-density gates remain open. Representative successful taps do not prove every touch target, every route link or art fidelity. See the [current version-specific report](../reports/tomorrows-roadworks.md) and [browser evidence](../architecture/evidence/rebuilt/README.md). Offline behavior passes do not confer GPU/appearance, FPS or art acceptance.

Gate 1 before detail/secondary interaction: final-lit thick foreground bend/rails, two grounded supports, sculpted nearby terrain, one faithful station screen and properly modeled roller. Compare matching source crops; no photographic foreground allowed. Reject thin strips, disconnected road, giant UI cards, smooth toy blocks or mismatched detail density.

Gate 2: full opening route/clock/roll hierarchy matches source before tiny props. Then desktop/390/320 comparisons; all 13 works, five More links, Dexter timeline and Severance live link; true preview/new-tab/focus; visible connected feed; actual pending/error/429/remote/expiration; reduced motion/graphics loss. Functional passes cannot approve source-fidelity failure. No current visual acceptance is claimed.
