# Low Tide, Later

**Status: authored scene-first candidate implemented; original-reference art gate pending.** The earlier non-Fair implementation was rejected and its acceptance remains withdrawn. The original image still controls composition/material judgment. See the [current art-director report](../reports/low-tide-later.md), [implemented runtime audit](../runtime-audit.md) and [saved rebuilt evidence](../architecture/evidence/rebuilt/README.md). The Fair remains unchanged.

![Low Tide, Later reference](../references/low-tide-later.jpg)

### Premise

Tomorrow is about to wash ashore. Again brings the tide back. Four pale time markers and found archive photographs inhabit one shallow cyanotype shoreline. The sea's returning motion carries the joke; no paragraph explains it.

### Art style and composition

Target the original image's tactile cyanotype print, viewed slightly obliquely from above. A deep Prussian/cobalt water field fills the left, meeting a granular salt-white shore which winds diagonally toward the lower right. Large irregular chalk/paper time bodies occupy the left-center foreground. One small oxidized-rust scallop rests on the dry right. Their scale, depth and wet contact are the composition, not scenery behind a timer.

In the opening desktop frame, three true archive prints occupy asymmetric positions: Severance on the upper-right dry terrace, Game of Thrones at the lower-left water/shore junction, Dexter at the lower-right exposed bed. Preserve meaningful uneven depths, worn white edges, curled corners and quiet blue inscriptions. Replace invented mock screenshots with the actual archive captures. Additional work continues along the shoreline beyond the opening frame; no gallery begins below the canvas and no row of ordinary cards follows the artwork.

The shore itself is the route. Sparse indigo thread/pigment lines connect exposures without becoming a navigation bar. The initial composition is complete at rest; the visitor never waits for a tour to assemble it. Keep intact screenshot centers, digits and the action optically dry. Wet edges and contact reflections carry immersion without a fishing puzzle. Do not introduce a tropical beach, underwater aquarium, resort objects, tide-height slider, wave dashboard or generic blue shader background.

### Palette and typography

Begin with Prussian blue #123CA6, pale salt paper #E8F1EC, dilute cyanotype #729ED0, marine ink #113F73, and shell rust #C76239. Dark water approaches nearly black blue in creases; the lit shore stays warm/pale enough to reveal granular texture. Brown seaweed is a sparse secondary accent. Photograph paper is whiter than the eroded time bodies; neither becomes bright plastic.

Use two fonts at most: Georgia or a similar high-contrast serif for large live pairs, Again and quiet blue show inscriptions, plus a condensed neutral sans for the vertical Countdowns wordmark and tiny status. Labels are limited to existing names, D/H/M/S, Again, the actual tally, Home, Worlds and necessary status/expiration text. Only the real live Severance destination retains its LIVE convention. No invented share symbols, badges or explanatory copy.

Large digits are actual material-attached curved ink/embossing surfaces, with existing slot choreography. Type stays crisp at the reference camera angle. Thin tide details must not cross glyph stems or create competing pseudo-numerals.

### Geometry and materials

**Implemented candidate.** A genuine oblique shore, four eroded chalk bodies, scallop Again, partly wet cotton prints and seabed now replace the frontal relief/DOM overlay. The authored model and depth-aware water share one camera. Every genuine version and actual More/timeline/live link has a physical surface and exact touch/focus stop. Chalk pits/chips and wet boundaries are separate from mapped fine detail. Water uses actual common bed depth, multiscale normals, bounded contact foam and shallow caustics; a thin wet physical film surrounds faithful print centers. This is a bounded optical approximation, not a fluid simulation. The latest shader revisions require actual GPU review.

Follow the selected [Blender 4.5.14 LTS asset workflow](../architecture/assets.md), [composition/type anchors](../architecture/composition.md), [input ownership](../architecture/input.md) and [physical inventory](../architecture/INVENTORY.md). Editable Blender sources, reproducible Python exporters, static GLB bundles, named-node manifests and material maps now exist under the concept’s scene directory. They are implemented candidates; a successful export does not pass the original-reference art gate.

Use world Y up, a shallow XZ bed and actual material bodies. A photograph's texture deforms with its paper mesh, a clock glyph patch follows its curved body, and water is a horizontal physical surface meeting the bed/posts. A front-facing plane at a Z layer behind every object is prohibited.

- **Shore:** author one wandering contour, broad low relief, shallow basins and broken deposits. A common shore field drives wet/dry albedo, water coverage, foam and grain/weed placement. Macro erosion belongs to geometry, intermediate granules to normal/bump, microscopic salt to roughness/albedo. Maps have UV-consistent scale, not enlarged dark noise squares. Dry grains may be instanced, but remain sparse and uneven; no screen-wide grain filter.
- **Four time bodies:** independently author uneven cylindrical chalk/flexible-paper forms with varied top rims, substantial visible top/side depth, shallow vertical tears/folds and asymmetrical base erosion. Their reference silhouette must survive an untextured clay render. Use authored continuous profiles/meshes, not four identical cylinders with sine perturbations. Roughness starts near 0.8–0.95. Scale-separated porous detail cannot replace physical rim wear.
- **Numerals:** UV-stable curved patches or ink decals share body perspective, shading and depth. A small surface offset may avoid z-fighting, but no upright DOM rectangle may substitute for the face. One bounded texture painter mirrors actual reels. D/H/M/S share the local coordinate system. A wet stain uses world water height plus an irregular absorption mask, not a uniform detached band.
- **Photographs:** thin worn salt-paper meshes with slight thickness, imperfect cut edges and nonuniform corner curl. Backing, actual printed screenshot, inscription and edge details move together. Keep the central image sufficiently planar/readable at rest. Fiber/roughness and edge discoloration establish age without repainting archived websites. The whole screenshot is its action, not only a curled corner.
- **Shell:** author a fan/scallop with nonuniform scalloped rim, converging curved ribs, rib-root thickness and fine transverse lamellae. Rust diffuse variation, pale mineral patches and mixed roughness reveal a found shell. A semicircular extrusion with identical decorative tubes fails. Again is printed/incised into its actual surface; the real tally is a dry etched tide notch beside it.
- **Water/weed:** shallow world-space water intersects lower post portions and catches paper contacts. Broad displacement, fine normals and optical depth are separate. Irregular brown ribbons/branched weed lie in the bed and at edges; moving sections respond to nearby water. A wet paper edge is permitted; glyphs and actual image centers stay dry.

Before implementation, an asset manifest must identify bed/contour, four body profiles, shell, paper shapes, shore/porous maps, wet/foam masks, weed silhouettes, environment source and real screenshot destinations. Critical geometry/maps are ready before revealing the scene. Procedural methods are acceptable only when their result passes the reference comparison; simple code does not justify toy forms.

### Camera and lighting

**Current source gate.** Daylight should make the water blue through depth/reflection, not through an opaque cyan blanket. Keep chalk warm-white above the line, cool mottled beneath it, with soft shore contact. Foam belongs to waves/post/shore contact; it cannot be a uniform tiled wire grid.

Match the reference's broad overhead still life with fitted orthographic or long-perspective lens, about 20 degrees away from top-down. The camera is fixed in rotation; its route follows the shore. The four bodies have different depths and substantial tops, while digits remain upright on local front surfaces. Begin at reference aspect, then author phone compositions. Do not retain the current frontal (0,0,18) relief projection or place artwork by normalized screen percentages.

Use broad high daylight from upper left, around 5500K, with cool low-contrast sky fill. It creates delicate short contact shadows beneath curled paper, shaped water glints and grazing relief on erosion. Start fill at one-quarter to one-third key contribution, then judge the image. Reflections contain broad bright sky/cloud structure aligned with the key; random environment noise and glossy blue gradients are not reflection substitutes.

Contact occlusion lives beneath post feet, shell ribs and paper gaps; the white shore stays clean. Wet contacts may have a subtle cyan transmitted tint. Use one tightly bounded shadowed key, starting at 2048 desktop/1024 phone if useful. Broad natural softness must actually be produced/authored; a numeric shadow-radius entry alone is insufficient. Judge exposure against paper whites, faithful screenshot blacks and blue pigment depth. No bloom, beams, haze, vignette or lens blur.

### Interaction contract

The new scene uses the shared lifecycle/action host without inheriting a shared visual composition. Fourteen exact scroll stops cover the opening and all thirteen genuine versions. Five archive-page links, the Dexter timeline and external live Severance destination retain native href/target/rel semantics; keyboard focus synchronizes the requested surface and runway. Home, Worlds and Clock stay independently accessible.

Native wheel/touch scroll progresses along a continuous shoreline camera rail through seven show exposures. Thread/shore markers and keyboard show/version links offer direct travel. The concept owns display transforms, camera route, physical surfaces and occlusion; the host owns cancellation, actual actions, native semantics and the preview adapter. Represent all 13 main works, show/archive More links with collapsed versions, Dexter's timeline and Severance's external live site. A small paper-edge tab/shore cut can expose a collection, with visible affordance and native equivalent. Navigation never depends on the secret.

Faithful screenshot textures lie on physical prints. Hover/focus frames the relevant work and gives a clear material-appropriate focus cue. Activation briefly approaches it and automatically opens the established real iframe preview; no unexplained second click. Cmd/Ctrl/Shift/Alt and middle-click open the genuine URL directly. Retain native close/backdrop/Escape/focus trap. Capture full camera/print/route pose before approach; restore it and originating focus on close. No activation through solid occluders. Transparent water and shadowless zero-alpha hit proxies have explicit pick policies.

Again is at least 44 projected pixels without covering neighboring work. Pending depresses the shell locally without tide/deadline/tally advance. Confirmed shared POST alone causes returning water. Error/429 releases the shell, retains actual state and shows existing short status in reserved dry space. A newly observed remote press makes a smaller shore response; updates during preview coalesce and never play a local success.

Mouse water contact creates a restrained ripple which can lift one nearby print corner and bend nearby weed. A stationary short phone tap may do the same; swipes navigate without firing a reset/preview/ripple or retaining capture. Cancel/lost capture/blur/hidden page/open preview clear input. Native anchors/buttons remain a semantic twin with visible focus-driven scene equivalents; clipping while healthy must not hide/inert them or remove them from assistive technology.

Exactly one salt-crystal crown sits beside/under the shell. A small salt contact makes its inspectable form visible; focus/touch/Enter can discover it without tide timing. It reveals Long may I count beside the clue, clear of clock/action/prints. Reset/navigation never depend on it.

### Motion choreography

**Implemented motion contract.** Decorative tide time advances only in visible/unfrozen frame dt. Ripple slots, shell/crown heights, hover captions and actual paper curls belong to preview snapshots. Remote observations during a preview coalesce into one small returning response. Reduced motion removes ripple/curl travel and assigns pending/secret states directly.

At rest, broad water current moves slowly/coherently; fine normals provide sparse glints. No habitual print bobbing, tile springs, saw waves or whole-screen pulses. Corner/weed responses inherit the same local disturbance field rather than independent animations.

On success, one broad incoming front advances along the existing diagonal, reaches bases over about 450–650 ms, then retreats over 1100–1500 ms. It curls through the same bed/contour, not a shader mask moving independently of geometry. Exclusion heights/regions keep glyphs, Again, tally and image centers dry. Residual staining is bounded temporary material state. Repeats retarget one front; they never accumulate tide height or geometry.

Existing reels retain 420 ms changed-digit ticks and 1080 ms reset spin with 45 ms column stagger, landing on actual current time. At most eight ripple slots live about 900 ms, sampled at least 120 ms apart. One/two interfering crests may occur locally with restrained amplitude; remote response is about one-third local strength. Corner lifts are millimeters relative to paper size with delayed settling, never detached image/card transforms.

The camera rail is deliberate/bounded, not free orbit. Focus reframes an exposure in a short eased move; sustained focus stops incidental surface motion there. Preview freezes approach/material input. Reduced motion uses immediate frames/true digits, fixes ambient phases, and removes waves/ripples/corner travel while keeping all navigation.

### Effects and render budget

Use depth-aware shallow tint, world-normal/view-dependent Fresnel and a small actual daylight reflection source. Caustic veins reach the pale bed below the water, rather than being bright lines painted on a front plate. Broken foam is a distance/contact treatment with scale-separated granules. Credible water/post/paper intersections are essential; fluid simulation, full-scene reflection effects and spray particles are unnecessary.

Prefer one water surface/pass plus scoped reflection/distortion inputs. Cheap bed depth/sampling is acceptable if spatial contact survives. Bound ripples, share paper materials, instance grains and reuse post/glyph textures. No new materials/meshes/render targets per frame or reset. Explicitly dispose environment/PMREM/render targets and loaded resources not discoverable by scene traversal.

Initial profiling ceilings: roughly 180,000 visible triangles/70 draw calls desktop, 100,000/45 phone. These are proposed ceilings, not evidence or permission to weaken defining geometry. Start DPR near 1.5 desktop/1.25 phone. Aim for 60 desktop/30 phone during interaction; report actual device measurement if available. Pause hidden rendering and sleep when deliberate ambient/reel/interaction work ends. Reduce fine water detail and distant assets before flattening macro forms.

### Responsive and fallback behavior

**Portrait candidate.** The route includes opening plus all thirteen records, not merely seven show stops. Native focus synchronizes the exact record stop before its variant pose. A new phone view must prove complete clock, shell/tally and first print after the optical/print fixes. The host recreates the authored profile when crossing 700px without a page reload, preserving native/shared state and normalized archive position; it defers that recreation until an open preview closes. Failure reveals the complete semantic/native archive.

Phone is a close view of the same shoreline installation. Author a shorter local diagonal with four readable bodies, reachable rust shell and one large recognizable print leading to later exposures. Two staggered pairs are permitted only if physical shoreline contact and broad blue/white balance survive; a 2×2 tile UI over a postcard list fails. Give 390 and 320 their own lens/route framing; preserve selected show and normalized route position on resize.

All actions remain at least 44 projected pixels; the actual modal is readable. Resize during approach/open cancels or recomputes projected aperture bounds and invalidates stale opening callbacks. Reduced motion updates actual clock once per second while decorative rendering sleeps.

Before the healthy first frame, keep an illustrated static fallback with real timer/actions/archive. Failed import/critical map/font/geometry or actual context loss transactionally restores that complete fallback, releases input and removes clipping; never a blank canvas or invisible enabled action. Retain all 13 works plus additional destinations. Fallback is a separate supported path, not the current rejected renderer relabeled as finished.

### Implementation boundaries

The active opt-in module is `countdowns/concepts/low-tide-later.scene.js`, with authored files under `countdowns/assets/concepts/low-tide-later/scene/`. `scene-host.js`, `scene-surfaces.js` and `scene-gallery.js` share lifecycle, picking, native actions and dynamic surface values only. Legacy module/style files remain fallback/historical material. No site build or backend change is introduced.

Use the proposed isolated scene-first host. Fair/Royal/Control keep their current paths unchanged. No framework, package manifest, site build, physics server or replacement shared API is needed. Offline authored static geometry/maps fit the hand-written site. Source edits belong in host/assigned concept/assets and generate.py when metadata/fallback wiring needs it; generated output is never hand-edited.

Preserve /api/countdown, preview/live separation, reels.js, faithful archived pages, exact labels/hrefs and native modal/focus. No independent tide counter/deadline, fake visitor avatar or share action. No three fixed DOM mount invariant, screen-percent object layout or required archive shelves in the healthy scene. The original defines silhouette/material/composition; functional tests cannot accept a simplified replacement.

### Fidelity checks

**Current art-director finding.** The refined desktop now has a clear oblique shore, descending real chalk clock, localized shoreline/post foam, scallop action and faithful photographs. Water still has conspicuous regular cellular/ripple structure and broad repeated reflection patches; the source is less periodic, with more irregular broken foam and depth variation. Chalk bodies remain evenly cylindrical/capped and prints visibly thick and clean beside the source’s salt-worn stock. The latest 390/320 portraits keep clock, shell/tally and first Severance print in view after phone glyph strengthening. Blue numeral/unit strokes remain delicate at the narrow width; chalk erosion and thin salt-worn paper remain source gates. Opening plus all thirteen exact record stops is implemented. Latest phone glyph captures are preserved separately from the earlier portrait. Root browser checks confirmed the physical shell reset and genuine Severance Season 2 preview/Escape/focus return. Verify the rest of the route, contact foam, wet paper and cancellation in the actual browser; these representative successful actions do not approve visual fidelity. The clear current optical approximation is not a fluid simulation and remains short of final source fidelity. See the [version-specific current report](../reports/low-tide-later.md) and [browser evidence](../architecture/evidence/rebuilt/README.md). The offline controller/model checks establish inventory and state behavior; no GPU appearance, measured FPS or art acceptance is claimed.

First build a reference-aspect still-life section with four live numeral surfaces, physical shell, one full worn photograph, correct daylight/reflection and actual wet/base contact. Compare clay pass, lit material pass and 390 frame against the source. Stop if post/shell silhouettes are toy primitives, water a flat blurry plate, images float above independent backings, or digits ignore camera/material depth. Do not add long routes/cursor effects to cover a failing resting frame.

Then compare the complete desktop opening against the original: diagonal proportions, substantial worn posts, curved readable ink, rich cyanotype shallow water, broken foam, correctly scaled salt pores, curled prints/edge shadows, sparse natural weed and credible scallop. Review actual success/settle and ripple/corner frames rather than a settings list.

Verify every work/destination, solid occlusion, visible native focus, modifiers/middle-click, true reset/tally, pending/error/429/remote/repeat behavior, exact preview pose/focus return, cancellations, scrolling and resize during approach/open. Review desktop/390/320, reduced motion, hidden page, blocked critical assets and real context loss. Separate visual observation, code-reviewed feel and tested behavior from unmeasured performance. Current rejected captures remain historical evidence; they cannot pass this spec.
