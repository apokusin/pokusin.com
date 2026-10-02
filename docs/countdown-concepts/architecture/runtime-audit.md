# Scene architecture audit

Status: proposed corrective architecture, October 2, 2026. The user rejected the seven non-Fair implementations. Previous reports accepting a simpler rendered interpretation are superseded by that rejection. This audit is grounded in the current source, the original Low Tide reference and its actual desktop capture. It is not visual acceptance of a new implementation.

## The failure is structural

`exhibition.js` currently turns the archive into a styled web page before a concept can create its scene. It moves three hard-coded Game of Thrones/Dexter/Severance anchors into an absolute `.art-mounts` layer, leaves placeholders in the original shelves, and supplies an orthographic hero camera. `exhibition.css` imposes a 900-pixel hero followed by navigation and two-column archive shelves. The concept can decorate those structures, but cannot naturally express its own navigation or a continuous composition.

The `pin()` loop at `exhibition.js:99` projects an object's center and a world-X width. It does not project the surface's corners, rotation, perspective or curvature, nor check solid-object occlusion. Every archive screenshot, numeral and button remains an upright DOM rectangle over the render. An apparent photograph can rotate its paper underneath while its printed image remains square to the browser. An object hidden behind another object may remain clickable on top. This is the central reason the concepts read as illustrated backgrounds with website controls.

Low Tide makes the mismatch explicit. Its reference is an oblique physical print installation: the posts have depth, the shoreline passes around their bases, and light catches ripples and curled photographic edges. The current scene places shore and water on frontal XY planes at Z −0.72/−0.48, positions every object by normalized screen coordinates, then paints upright DOM digits and cards over them. More grain, a higher shadow resolution or a longer material-settings list cannot produce the missing spatial relationships. The implementation's broad blurry blue field, flat paper/image layering and simplified shell miss the original silhouette and surface richness.

Fair succeeds because it overrides this arrangement: physical displays mirror the true reel model; actual screenshot meshes belong to buildings; the scene has a real spatial plan; raycasts honor visible objects and occlusion; native links become a semantic twin; and a preview approaches its actual screen. It also manually undoes the three representative-card relocations. Requiring each new concept to fight the shared host this way would perpetuate the failure.

## Keep the working Fair isolated

Route `the-almost-fair` through the existing `initExhibition` host and its current CSS. Do not rewrite its materials, controls, pose restoration, machinery or scene geometry as part of this correction. Royal/Control also retain their existing path. A new `scene-first` path is opt-in per rebuilt concept, so incomplete migrations cannot silently change the accepted Fair.

The new host should not be a game framework, editor, router, entity-component system or physics abstraction. Two small static modules are sufficient: a host for lifecycle/input/semantic adapters, and a surface utility for live numerical textures and projected preview bounds. Each artist-owned concept supplies its own scene, camera, materials, lighting and navigation. Extract numerical drawing from Fair only by copying its proven recipe into the new utility initially; refactoring the Fair dependency can wait until separately justified.

## Small scene-first contract

The host receives the existing real archive nodes and shared countdown callbacks. It does **not** move three representative cards or expose `.shelf` as a composition primitive. Each exhibit is identified by its real href and contains its native anchor, exact label, faithful thumbnail and show association. Keep all 13 current gallery versions, the seven show destinations, collapsed-version links, Dexter timeline, Home and Worlds available. A scene decides which three/four are visible initially and how the remainder appear; the data does not prescribe rows or uniform mounts.

```js
export async function create(host) {
  // Own a complete composition. There is no supplied hero lens or card layout.
  const camera = /* artist-owned camera */;
  host.useCamera(camera);

  const exhibit = host.exhibits.find(item => item.href === wantedHref);
  const screen = /* real screenshot surface inside the artwork */;
  host.bind(screen, {
    kind: 'preview', native: exhibit.anchor,
    focus: () => frameAndHighlight(screen),
    blur: () => clearHighlight(screen),
    activate: () => approachThenOpen(exhibit, screen)
  });

  host.bind(resetMesh, { kind: 'reset', native: host.dom.reset });
  // Clock painter reads the real digits and the same reelPlan/reelPosition.
  const clock = host.numerals({ surfaces, appearance: authoredType });

  return {
    ready: criticalAssetPromise,
    frame(time, delta), resize(width, height),
    focus(id), capturePose(), restorePose(snapshot),
    pending(value), celebrate(), remote(), freeze(value), dispose()
  };
}
```

This is a proposed interface rather than a requirement to add every method to every scene. `bind`, a camera, lifecycle hooks and a numerical painter are the essential parts. A tabletop needs no walking controller. A material installation may have a constrained drag rather than scroll. A shoreline can use native scroll as a camera rail. Their behavior stays inside their modules instead of adding theme branches to the host.

### One real state, two representations

`themes.js` and `/api/countdown` remain the state owner. Scene textures consume actual `getDigits()`, the real tally, pending/status and `reels.js` plans. They never calculate a second deadline or invent a successful press. Screen-reader values update immediately while visible glyphs roll. Use shared canvas texture atlases or the smallest bounded per-face textures; update only changed digits or active reel frames. Reduced motion wakes once per second for a real clock without an ambient render loop. Tallies must support growth beyond the initial number of characters.

### Real surfaces, native semantics

Closed archive exhibits are screenshot textures on their physical meshes. Use the correct UV transform and preserve the actual archive artwork. Camera movement, shadows, corner curl, perspective and occlusion therefore affect the paper/frame and printed image together. Glyphs and sparse labels are similarly material-attached textures/decals or appropriate scene text, not frontal rectangular DOM tiles. Actual Home/Worlds/status may remain a very small native overlay where conceptually appropriate; this does not justify a full web layout under the scene.

Keep native anchors/buttons in meaningful semantic order and clip them only while the new host is healthy. Never apply `display:none`, `hidden`, `aria-hidden` or `inert` to that semantic twin. Native focus must frame the corresponding object immediately or with a short bounded camera move, show a clear material-appropriate focus indicator, and retain a visible focus cue for as long as focus remains. A geometric clue alone is insufficient if keyboard focus has no visible equivalent. A compact native focus drawer is an available fallback for multi-version collections; it appears only on focus and exposes the exact real links. It must not become another permanently visible menu.

Register action meshes and semantic nodes once. The host handles pointer selection with an explicit nearest-solid occlusion check; decorative transparent meshes and zero-alpha hit proxies are separate, shadowless pick layers. A screenshot behind wax, another cel or a plant cannot be activated through that occluder. Enlarge a physical action hit surface to a 44-pixel projected target without making it cover a neighboring exhibit. Hover changes only the relevant object. A click is recognized on pointer release after a bounded travel threshold, while drag cancellation, pointer cancel, lost capture, blur and visibility changes clear all input.

For pointer activation of real links, Cmd/Ctrl/Shift/Alt and middle-click open the real URL using normal link semantics, without entering the camera/preview choreography. Keyboard Enter invokes the corresponding native action. Dragging a camera or material does not also open a preview or reset the clock. Do not require pointer lock or avatar control to reach work.

### Preview remains a readable native modal

Reuse the established `archive:open`/`archive:overlay` adapter in `generate.py`. Capture the entire scene pose and originating semantic node before any approach. Project the actual screenshot surface corners into **viewport coordinates**, including the canvas bounding rectangle offset, to obtain the finite opening rectangle; a world point or stage-only coordinates are insufficient.

On activation, each concept may briefly turn/approach its exhibit, then automatically open the existing readable iframe modal. Do not introduce an unexplained mandatory second click. The material may frame an approached aperture only where that aperture can be front-facing and readable; arbitrary perspective CSS3D iframes are not required to make the closed exhibit genuinely 3D. The actual archived page remains unaltered. Freeze all camera/material input while open, retain the existing focus trap/close/backdrop/Escape/new-tab behavior, and restore the exact prior pose plus originating semantic focus on close. Resize during approach or open must cancel/recompute a stale projected aperture. Rapid open/close must invalidate deferred approach callbacks.

### Asset readiness is part of architecture

Replace fire-and-forget `texture()` for critical art with an awaited asset loader. Critical geometry, maps, archive stills, fonts and reflection source must be decoded and usable before the host marks the scene healthy. Keep the static fallback visible until a composed first frame has rendered. Do not expose pale untextured primitives and call them an entry animation. A late resource callback after disposal must release its own result and must not resurrect a scene.

Authored static GLB/mesh data, UV maps, paint masks, normal/roughness/AO maps and simple texture atlases are permitted without a site build step. Offline asset authoring is not an added runtime framework. Each concept needs an asset manifest listing critical assets, units/pivots/UV assumptions, fallback and ownership. Procedural geometry is appropriate for intentional simple forms; macro wax, worn shells, curling paper and fruit membranes need authored profiles/meshes, rather than primitive shapes with noisy albedo. Art-only raster layers may supplement surfaces and fallback, but may not substitute for primary silhouettes or contain live timer/screens/copy.

Configure reflection and key/fill geometry per scene. A single renderer may support a concept-owned small render pipeline, but no default bloom/AO/vignette should be imposed. Baked occlusion/contact terms and correctly bounded shadows are cheaper than unexplained global dirt. A polished steel environment must contain the actual shaped softboxes needed to read as steel; an underwater map must use the real view/light direction. Profile before reducing a defining silhouette or converting the concept into a flat collage.

### Resize, scheduling and failure

Desktop, phone and 320-pixel layouts are authored camera/composition presets with persistent exhibit identities. Resize cannot arbitrarily permute semantic order, drop shows or shrink all actions below 44 pixels. Camera rails preserve a normalized selected position across resize; tabletop arrangements preserve the selected sheet/tag. Low quality reduces fine detail and DPR first, not the defining art silhouette.

The host schedules frames when the scene reports deliberate ambient motion, active interaction, reel animation or local/remote choreography. `frame()` can request more frames; a finished static installation sleeps. Hidden pages stop rendering and clear input. Delta is bounded on return; camera/success phases must not jump through long hidden-page intervals. Each concept chooses whether frozen preview motion resumes or settles, with actual state still updating.

Context/import/critical-asset failure reveals the complete illustrated DOM archive and live controls, removes scene clipping/pointer blocking, releases capture, closes any scene-only drawer, and preserves the actual native modal if it is already open. Do not attempt an endless context-recovery loop. Every owned texture, geometry, material, render target, environment/PMREM, observer, timer, event and capture needs a clear owner. Do not rely solely on scene traversal: render targets and unreferenced loaded textures are not guaranteed to be discovered there.

## Faithful Low Tide architecture

The reference remains the target: a deep cyanotype diagonal water field, four substantial pale eroded posts, a small rust scallop, rough salt paper, brown algal traces and irregular worn photographs. It is a broad oblique still life, not a navigable ocean, a generic blue shader demo or a photo-card webpage.

Build an XZ shoreline bed with world Y up, low broad height relief and an authored winding contour. A shallow real water surface occupies the low side and intersects the posts' lower portions; the water must not be placed as a frontal backdrop behind every object. Use a high oblique perspective or fitted orthographic lens matching the reference's roughly 20-degree departure from top-down. Lock the main camera's rotation; native wheel/touch scroll moves along a winding shore spline to later exposures. Direct keyboard show/version selection moves to the corresponding exposure. The initial frame matches the reference's asymmetric three-work arrangement; later objects continue that same shore, without a below-the-canvas gallery.

- **Posts:** four independently authored worn cylindrical/chalk-paper bodies with asymmetrical top rims, folded/torn vertical contours and substantial visible top/side depth. Primary erosion belongs to geometry, medium-scale pores to normal/bump, microscopic grit to roughness/albedo. Face-mounted curved glyph patches share post shading and perspective and mirror the actual reels. Wet blue stain derives from world water height plus an authored irregular saturation mask; do not use a uniform band or square digit backing.
- **Shore:** granular pale salt with shallow depressions and believable colored grains at macro/micro scales. A continuous shore signed-distance/mask field drives wet albedo, foam, water coverage and scattering placement together. No blurred diagonal texture pretending to be an edge. Seaweed should be irregular flattened ribbons/branched silhouettes resting in the bed, with sparse movement only when a nearby wave reaches it; it must not become a row of decorative upright stalks.
- **Water:** coherent broad displacement and two scale-separated normal fields, using real world normals, view direction and key direction. World-distance depth tint, restrained reflected daylight, and small bent caustic veins on the actual bed establish shallowness. Broken foam collects at the authored shore and posts, so boundaries feel physically connected. Opaque screenshot centers are excluded from optical distortion; paper edges may be wet. Do not replace cyanotype photographic richness with smooth blue gradients or a Cartesian checker pattern.
- **Photographs:** actual faithful archive captures applied within textured worn paper meshes, with curled/lifted corners and slight thickness. Deformations act on print and backing together, except the central screenshot region stays sufficiently planar to read. Show labels belong to the adjacent paper/bed. A focus or nearby ripple causes one related corner to lift by millimeters, then settle; no habitual whole-card bobbing or row hover animation. Each whole image is its action region.
- **Scallop:** a modeled fan with irregular rim scallops, converging curved ribs, fine lamellae, chalk deposits and nonuniform oxidized rust. It should read as a found shell at rest, not an orange semicircle with evenly spaced tubes. Again is a small material-attached engraved/printed face. The tiny real tally is a dry tide notch nearby. Pending gives a shallow mechanical/soft-material depression only. A successful request owns one broad incoming front which advances, curls around bases and retreats, plus existing reel motion; failure releases the shell without a wave.
- **Crown:** a small salt-crystal crown tucked beside/under the shell, discoverable with the same physical focus behavior as other actions. One quiet revealed Long may I count note; no second gag label or fake share icon. Remote presses make a modest tide-edge response, never a full local ceremony.

Mobile is a separate close shore view, with the four bodies arranged along a shorter local diagonal, rust shell reachable, and one recognizable photograph leading offscreen to the next exposure. It must retain depth and broad blue/white proportion; stacking conventional rounded time tiles above a single card is not a phone interpretation of this concept.

The first implementation gate is a still-life section containing the actual four live surfaces, scallop, one complete photograph, meaningful wet contact and authored reference lighting. Render it at reference aspect and 390 pixels. If it still resembles boxes over a sea plate, stop before adding the remaining archive, cursor ripples or crown. Good function alone does not pass this gate.

## Migration order and gates

1. **Protect:** keep Fair/Royal/Control on the legacy host; record screenshots and their preview/reset/focus checks before touching shared code. No backend/schema changes.
2. **Cut composition dependency:** add the new opt-in loader before existing `initExhibition` manipulates cards. Generated markup may keep native archive fallback in place; healthy scene-first CSS clips it and makes the canvas viewport-sized. Avoid globally changing `.art-project` rules that Fair inherits.
3. **Prove one scene:** one concept's whole initial reference frame with actual geometry/materials/live surfaces. Compare side by side at the same viewport; list missing silhouette, spatial relationships, key light/reflection and texture scale explicitly. There is no acceptance based on renamed interpretation.
4. **Prove actions:** hit/occlusion, every real archive link, modifier/middle clicks, native focus-visible equivalent, real reset/tally/pending/error/remote, repeated resets and preview exact restoration. Test cancellations and rapid preview/reset sequences.
5. **Prove responsive/failure:** desktop/390/320, wheel/touch route, camera-state resize, reduced motion, hidden page, blocked scene/texture/font, actual WebGL loss during interaction and preview. Fallback has all 13 anchors and all version/timeline destinations; no unclickable clipped remnants.
6. **Then expand:** use the demonstrated host for the next concept while retaining its own camera and navigation model. Only integrate long archive paths and secondary material gags after reference fidelity passes. Dispose/switch cycles must not keep render targets, intervals or duplicate inputs alive.

Specific risks: global `.art-project` CSS leaking into Fair; double binding existing native click handlers; semantic anchors retaining the wrong display label from old representative-card relocation; queued camera callbacks opening a modal after Escape; stage-relative preview bounds mistaken for viewport bounds; replacing the DOM numerical source with an independent timer; reduced-motion clocks sleeping forever; asynchronous textures updating disposed materials; zero-alpha hit proxies casting shadows; glass/water meshes falsely occluding action raycasts; focus restoration triggering another approach; and fallback hiding collapsed versions despite restoring the 13 gallery thumbnails.

The acceptance report must separate observed visual fidelity, code-reviewed motion rules, browser-tested behavior and unmeasured device performance. The previous seven accepted reports passed function while relaxing the original art; that relaxation is the mistake this architecture must prevent.
