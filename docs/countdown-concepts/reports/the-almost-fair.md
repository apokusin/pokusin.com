# Art direction review — The Almost Fair, world-first revision

**Status: revised visual direction passed; verified runtime paths recorded separately.** The earlier implementation acceptance below is superseded. The user rejected the reliance on conventional website styling/layout and separately identified insufficient material texture and lighting compared with the generated reference. This review compares the actual previous desktop capture, the generated reference, the source/spec, and the new [implementation brief](../specs/the-almost-fair.md). The report preserves the corrective direction, intermediate observations and final visual acceptance separately. It does not infer unobserved interaction or device performance from still images.

## What the previous review got wrong

The previous report instructed the implementation to remove the reference's material texture, clouds, landscape, cloth scallops, architectural bevels and miniature richness. That turned an atmospheric, authored fairground into flat generic geometry. It treated the requested low-poly character and clean shading as reasons to flatten the entire world. Low polygon count does not require featureless materials or uniform illumination.

The prior screenshot also made a structural problem visible: a conventional masthead above a canvas, screen kiosks around a pinned timer/button, then show tabs and a standard archive underneath. The world became a hero illustration decorating a website. The physical player and clock alone could not compensate for that framing. The prior acceptance gates were too forgiving: they checked legibility and faithful content while accepting a visible layout the user had not wanted.

## Creative direction to protect

The reference's best idea is a miniature place ready for something that is continually postponed. Its giant clock, back-facing visitor, round forms, staged promenade and almost-too-prepared exhibit fronts tell that story together. Restore the warm light on cream plaster, the cool jade shadows, the cloth roofs, actual recessed screens, bevelled machinery and distant softness. Those elements create a coherent art direction rather than merely a theme color.

The real archive should be encountered through this place. Give exhibits specific physical operations and supports; do not assemble thirteen thumbnails into a wall and call it spatial navigation. The postponement machine should visibly drive the shared clock and leave a small trace in its bounded ticket/token tray. The scene's forms and responses should convey the premise before any labels do.

## Five prioritized physical operations

1. **Promenade and presence:** Full viewport; back-facing simple character; connected sculptural route; foreground overlap, midground court and distant skyline. Remove masthead, title overlay, show navigation strip, footer and below-fold archive in the healthy world. Make the next reachable path and at least two distinct exhibit fronts legible without a tour. The camera follows intent and preserves a stable horizon.
2. **Postponement machine:** A substantial coral cap/lever with modeled linkage to the clock. Activation compresses it while pending, confirmed success drives the real drum rewind and ejects one bounded ticket/token, and a prepared opening banner quietly folds back. This single material response should be cleverer than text explaining the joke. Error releases it without ceremony. No permanent flat HTML button or duplicate timer values should sit above the geometry.
3. **Projector encounter:** A supported, warm recessed exhibit opens slightly on approach. Activation approaches the camera to its real aperture and operates the genuine preserved page there. The aperture should remain framed by the world; no centered generic website modal/backdrop or toolbar appears. Closing restores the exact saved player/camera state and focus. Phone framing must preserve a readable iframe area instead of trying to keep the entire fair visible simultaneously.
4. **Archive mechanism:** Version changes turn an easel, hinge a folio or move a carriage along a finite track. Each movement has an obvious physical cause and settles before reading. One physical operation has one meaning; hovering an exhibit must not rotate versions or open the live site. Focus/touch equivalents must remain available without a precision gesture or required walking.
5. **Spatial shortcuts and worlds:** An actual miniature plan at the arrival court and/or a constellation gateway offers direct reach. Its geometry resembles destinations rather than text rows: choose a model exhibit to travel/focus, or a distinct material object to enter one retained theme. Names appear beside the selected physical object only. The gateway is recognizably an exit; it must not be confused with an archive preview. Keyboard focus frames the selected object before activation.

The single easter egg remains a crown inside the lower clock gate. It should reward a side glance or focus with Long may I count, not become a task, extra reset button or second counter.

## Non-obvious feel and discoverability

A genuinely spatial site needs feedback without turning every object into a labelled web control. Give the machine a visible mechanical joint and coral tactile surface; give archive screens a warm recessed light and one restrained leaf movement; give the route a widening threshold; give the shortcut plan a clearly distinct miniature scale. Pointer cursor feedback is supplementary. An interaction that requires an unseen hover region or a label to explain it is not yet resolved.

The first scene must be settled, with only tiny cloth and distant cloud motion. The character must never walk itself into the world before input. Movement accelerates briefly, brakes faster and is camera-relative; rotating consumes release. A preview approach is a composed camera movement that ends square enough to use the real site. It must not drift, zoom indefinitely or fling the user back on close. Save the camera and player, release held input, and require fresh movement input afterward. Reduced motion replaces approach with a cut and leaf motion with an immediate readable state.

Keyboard focus cannot remain invisible behind the camera. Its semantic target should induce the corresponding physical acknowledgment and framing. The same target cannot mean preview on desktop and reset on touch. Phone movement/orbit must coexist, cancel reliably and avoid collision with the aperture's live content. These invisible rules define whether the environment feels authored and trustworthy; screenshot approval cannot verify them.

## Material and lighting corrections

Restore different surfaces, rather than global grain: fine plaster mottling/pores; painted timber joints and limited wear; ribbed cloth folds and scallops; dark metal/paint around the drum casing; subtly tiled coral walls. Bevels should catch the warm key. Archive imagery bypasses recoloring and tone-mapping changes that corrupt its content. Procedural textures and authored geometry can deliver this without a new model pipeline or realistic scatter assets.

Shape the first frame with a warm upper-left/front key, a cool sky fill, legible recesses, softly contacted feet and overlapping broad shadows. The backdrop needs near/far separation through sky/cloud/landscape composition. Do not produce a uniformly green world with dark hard shadows, or compensate with bloom, depth-of-field, chromatic aberration and screen noise. Check cream highlights and charcoal apertures directly against the reference. The objective is tactile material depth under clean shading.

## Revised acceptance gates

The actual first frame must show a coherent art installation occupying the viewport, not a conventional website using a 3D hero. It must restore the reference's warm/cool light, material distinction, recesses, bevels, cloth silhouette and compositional depth. No header, title overlay, show tabs, persistent DOM clock/button, footer or ordinary card gallery should be visible in the working world. A screenshot alone is necessary but insufficient evidence.

Verify real shared reset, visible pending/error behavior, genuine archived content inside the physical projector frame, exact close restoration, focus-driven discovery, phone gestures, reduced motion, repeated operation, context loss and direct access to every version. Review actual desktop/390/320 frames and deliberate motion, then record what was observed separately from source-reviewed behavior. The direction-stage brief was not marked passed before runtime review; the final visual and runtime observations below now record its implemented scope.

## Rebuild checkpoint — observed visuals and source review

**Observed first desktop render:** The rebuilt full-viewport composition removes conventional website chrome. Bevelled clock casing, modeled drum supports, scalloped cloth, tiled relief and a physical engraved reset machine establish a stronger place. The initial evenly spaced tree row still flattened the backdrop, foreground staging was empty, and feet were barely visible. Feedback called for asymmetric distant clusters, one cropped foreground object, warmer sun/cooler shade, and exposed dark feet. Blank exhibit textures were a known runtime bug, rather than an accepted visual treatment.

**Observed second desktop render:** Faithful archived images now distinguish the exhibits, the foreground physical plan and Worlds gateway provide parallax, and sunlight separates cream surfaces from jade shadows. This is a meaningful compositional improvement over the former page-and-hero layout. At that checkpoint, the clock arch needed more sky headroom and the plan's seven generic token shapes offered little silhouette association with the pavilions. The report requested a modest subset of distinct miniature shapes and a physical focus/hover response, rather than more explanatory labels.

**Observed 390 × 844 portrait render:** The character's two dark feet, readable physical clock, coral machine and sky headroom are visible. The frame reads as a continuous full-screen environment. At this checkpoint, however, much of the plan's operating top was clipped at the left edge and the Worlds ring/core was clipped at the right. The navigation objects risked reading as incidental edge decoration. No archive frontage was visible in this first portrait view, making recognizable direct-access geometry especially important. Feedback requested a modest portrait scale/position adjustment that preserves the clear central route and corresponding collision bounds. This portrait checkpoint is not final acceptance.

**Source-reviewed material recipe:** The new helper implements packed 256 px world-projected procedural textures with distinct limestone, plaster, cloth, terracotta, paint and enamel treatments. Neutral tone mapping uses exposure 1.05; warm directional key intensity is 2.65, cool hemisphere fill 0.57, rim 0.28 and procedural environment reflection 0.34. Shadow maps are 2048 desktop / 1024 phone; distance fog separates the background over 29–77 units. The sky uses a generated cloud field and foliage positions now derive from asymmetric clusters with a clearing behind the clock. These are source observations, not a device performance measurement or proof that every new surface is perceptually distinct on phone.

**Checkpoint status at that stage:** Visual direction improved; final portrait composition and genuine projector/machine/shortcut interactions still require direct review. Nothing in this checkpoint marks pending work as passed. The bounded ticket/token consequence remains a specified creative direction until it is visibly implemented and verified.

## Final visual review — world-first slice

**Evidence reviewed:** Actual rebuilt runtime captures named `fair-desktop-polished.png`, `fair-mobile-polished.png`, `fair-map-mobile.png` and `fair-projector-mobile.png`, alongside the original reference. Desktop is 1280 × 900; portrait captures are 390 × 844. These are running-scene captures, not generated mockups. The earlier checkpoint criticism remains above to document what was corrected.

**Observed desktop:** The environment now occupies the entire viewport. Conventional masthead, page title, show tabs and below-fold card archive no longer govern the first frame. The clock has deliberate sky headroom, bevelled supported drums and physical serif numerals. The character has visible dark feet and contact with the continuous promenade. The scalloped canopy, tile relief, recessed faithful screens, distinct plan tokens and round gateway establish differing physical operations within one material family. Foreground objects overlap the route, with cooler distant foliage/clouds behind the architecture; warm cream light and jade recesses restore substantially more depth than the rejected flat scene. This is a coherent world-first interpretation of the reference, while remaining simpler than its generated material detail.

**Observed portrait:** The clock, grounded visitor and reset machine remain readable. The complete gateway ring/core and sufficiently recognizable plan top now survive the narrower frame. Remaining plinth-edge cropping reads as deliberate foreground overlap, rather than hiding the operative surfaces. The portrait first frame concentrates on the court instead of shrinking all seven exhibits into view. In the focused plan capture, the whole route diagram and its distinguishable tokens fill a comfortable phone area. The actual projector capture shows the preserved Dexter page inside the world object's tile/metal frame, with sky, architecture and the supported lower frame still visible. It is an exhibit encounter rather than a generic centered website modal.

**Visual decision:** Pass the revised visual direction for this implemented slice. This decision covers composition, material/light direction, physical clock/control presence, focused plan and scene-framed live projector. It does not mean every ambitious reference detail has been replicated, that all other retained concepts were redesigned, or that future optional interactions exist. No remaining critical first-frame visual defect was identified in these four captures. At this visual checkpoint, the implementation visibly provided a physical tally/reel response. The subsequent numbered paper-chit addition is now source-reviewed and visually verified below.

**Interaction evidence supplied by root:** Root reports a native pointer activation on the physical Again inscription incrementing the local shared tally from 369 to 370 and moving the actual deadline one calendar month ahead, which was 31 days for that checked date. Root also reports physical red-plan-token selection traveling to Dexter, an actual raycast on its exhibit opening the genuine live Dexter page in the framed aperture, and Close restoring the original exhibit pose plus canvas focus. These are explicitly root's runtime observations, not tests inferred from these screenshots. Those observations preceded the keyboard/reduced-motion/failure verification now recorded below; the four visual captures themselves did not establish those checks.

## Final runtime verification — root observations

Root subsequently confirmed the following actual browser interactions. They are supplied runtime evidence, distinguished from this art director's direct still-image review and from source inspection:

- Keyboard Tab navigation from the crown to the GoT archive anchor, then native Return, opens the genuine page in the physical projector. Close/Escape restores the initiating link or canvas focus. After clicking nonfocusable iframe content, Shift+Tab returns to Close rather than escaping the interaction.
- Resizing an open projector from a 1280 px desktop viewport to 320 × 740 refits its visible aperture to approximately 281.6 × 180.2 px within the phone viewport. This verifies a resize path in addition to the separately reviewed 390 px portrait composition.
- Under actual reduced-motion settings, the physical clock advances with the real countdown, and activating the crown displays Long may I count. The root fixed immediate explicit wake so discovery is visible without waiting for decorative animation. The supplied `fair-reduced-c.png` proof visibly shows the phrase in the clock arch and an otherwise settled world.
- An actual `WEBGL_lose_context` event on phone restores the illustrated ground plan with the real clock/Again, seven direct show links and all thirteen native archive cards. The supplied `fair-context-fallback-new.png` capture visibly establishes the readable clock/reset and seven-show route; root's DOM/runtime observation establishes the complete thirteen-card archive. Unavailable movement/travel controls are removed.
- The physical Worlds encounter now supplies ten readable destinations—Home and nine other retained themes—with differing miniature geometries rather than a permanent text-row selector.

**Verified reset consequence:** `fair-machinery.js` now creates one reusable 0.52 × 0.38-unit paper chit bearing the confirmed shared press number. Its bounded geometry ejects/bends/retracts for 1.35 seconds after the confirmed spin trigger; it is suppressed under reduced motion and reuses its texture/geometry rather than growing a collection. Root verified an actual successful reset from 371 to 372. The supplied `fair-ticket-reset.png` runtime capture visibly shows ticket 372 above the compressed coral cap while the physical digits spin, and root observed its retraction by 1.35 seconds. Reduced motion produces no chit. This source plus observed response establishes the bounded choreography. A persistent collection/tray and elaborate opening banner are not claimed.

**Current practical decision:** The revised visual direction and the specifically reported native reset, map travel, real projector, focus restoration, responsive aperture, keyboard, reduced-motion and graphics-loss paths are verified for this world-first slice. Device frame-rate targets and hardware performance are still targets, not measurements. The newly implemented paper-chit response is also visually verified as described above. No failure path or hardware result is inferred from screenshots.

## Committed runtime evidence

[Desktop](../qa/the-almost-fair-world-desktop.jpg) · [390 px](../qa/the-almost-fair-world-mobile.jpg) · [320 px](../qa/the-almost-fair-world-320.jpg) · [Source/runtime](../qa/the-almost-fair-world-comparison.jpg) · [Plan](../qa/the-almost-fair-world-plan.jpg) · [Projector](../qa/the-almost-fair-world-projector.jpg) · [Worlds](../qa/the-almost-fair-world-worlds.jpg) · [Ticket](../qa/the-almost-fair-world-ticket.jpg) · [Reduced motion](../qa/the-almost-fair-world-reduced.jpg) · [Graphics loss](../qa/the-almost-fair-world-fallback.jpg).

Physical cabinet latches now retain pointer/touch access to the real show pages, collapsed variants and Dexter timeline. Root verified the GoT latch and browser Back into the active world. The underlying archived versions remain unchanged.

---

## Historical review — superseded

Everything below records the earlier direction and runtime checks. Conflicting instructions, the rejection of material/atmospheric reference features, and the prior visual acceptance no longer govern this concept. Backend/input checks may remain useful evidence of the old implementation, but they do not establish the new world's quality.


Reviewed the [actual image](../references/the-almost-fair.jpg), [spec](../specs/the-almost-fair.md), and shared guide. The first sections retain the pre-implementation review, whose recommendations were incorporated into the spec. Implementation refinements, visual acceptance and subsequent runtime corrections are recorded below.

## Creative judgment

The new interaction model earns its place: walking can turn a retrospective archive into a place that belongs to the visitor. The anonymous round-headed figure is inviting because it asks for no identity or performance. The branching path, giant clock and compact architecture make the first frame understandable. The postponed opening is a playful reason for this small place to remain perpetually ready.

The spec is more faithful to the user's request than the generated image. Retain its spatial composition, but reject the photographic grain, realistic trees/clouds, stairs, glossy miniature realism and ornamental crowns. The implementation should look like a carefully proportioned low-poly sculpture under clean light: four colors, crisp facets, rounded character, restrained contact AO and almost no surface noise.

## Visual strengths to protect

- A back-facing player provides an immediate invitation to enter rather than inspect from above.
- A branching cream promenade creates choices without a map full of markers.
- The clock is tall enough to orient the visitor from across the world.
- Different pavilion silhouettes promise different archive encounters.
- The coral plunger makes the central joke an action the player can see.

The clock court should remain calm and generously scaled. Place two readable exhibits beside the first route choice, not behind long corridors.

## Friction and invisible-feel risks

A third-person world introduces more uncertainty than a webpage: is the floor clickable, can the figure move, is a screen an image or a portal, is the compass merely decorative? Make movement and browsing visible in geometry. A short cream path leads directly toward the clock, and a coral route symbol sits on the first exhibit's supported lectern. The persistent compass uses the same motif and has the accessible name Archive. Its quiet route drawer supplies Clock, every show and direct preview links; walking is optional.

Click-to-walk and drag-to-orbit need different thresholds. Without a release rule, rotating the camera opens previews or sends the player walking accidentally. Use a 6 px desktop / 10 px touch drag threshold; consume the release after orbit or thumb-pad motion. Preview targets win over terrain. Do not require a first click to enter pointer lock or a separate game mode.

The camera defines the feel more than polygons do. Excessive lag makes the player slippery; instant yaw jumps cause disorientation; wall avoidance can become a sudden zoom. Movement accelerates briefly and brakes faster, with a stable horizon and no head bob. Low buildings and open sightlines should prevent most collisions before camera collision logic is needed.

## Feel decisions incorporated

The visitor spawns with the player in the lower third, the clock and plunger in the central distance, and two reachable exhibit fronts already visible. A subtle half-step lean on explicit world focus establishes that this is the controlled figure; do not begin autonomous walking. Feet move only during actual movement, with a 150 ms acceleration, 90 ms braking and 180 ms turn. Movement directions follow camera yaw. On touch the thumb pad has a visible dead zone, never keeps walking after release, and ignores touches that begin on a preview/control.

Exhibit fronts receive a thin coral edge and a small 12-degree leaf opening on approach. Name and one clear preview target are readable at rest; no interaction needs the player to collide with a screen. Opening a preview saves the exact player/camera/selection state, clears keys and touch input, and freezes locomotion. Closing restores pose and focus without a return fly-through. Direct travel is a 300 ms dissolve to a predetermined safe pose facing the chosen exhibit; reduced motion cuts. It never changes the shared countdown.

One hidden crown is a tiny embossing on the inner clock gate. Give it a reachable DOM target, tap/Enter activation and optional 700 ms hold; a hold cannot be the only way to discover it. It reveals Long may I count and nothing else. There are no unlocks, collectibles, reward counters or other secrets presented as objectives.

## Asset and implementation direction

Build a small hand-authored world with deliberate silhouettes, not a general procedural town. Seven pavilion operations should differ: hinged leaves, timeline rail, inclined desks, rotating easels, shaded lecterns, folded plane and recessed terminals. Use one simple three-part character rig. Contact AO darkens creases by 12–18%; smooth sphere shading is intentional, while architecture stays clean and faceted. No grasses, realistic trees, noisy ground textures or decorative crowd avatars. A readable ground-plan fallback and direct route drawer are part of the concept, not emergency afterthoughts.

## Art acceptance gates

At first frame, an unfamiliar visitor identifies player, path, clock, Again and two exhibit fronts in three seconds. A first drag rotates without accidental navigation. Releasing movement stops promptly. Every show can be opened without walking. Preview close restores position and camera precisely, including after a held movement key. Camera cannot remain trapped behind architecture. On phone, movement and orbit coexist with normal controls; outside the world, document scroll remains ordinary. The four-color matte language survives at 320 px, reduced motion and WebGL failure. The fair never adds a HUD, quest, required game skill, avatar account or imaginary other visitors.

## Implementation refinements

Desktop and phone browser review exposed a conflict in the proposed camera recipe: the narrow lens and low look target hid the tall clock above the viewport. The implemented 48-degree lens retains the 6.5-unit desktop / 7.5-unit phone distance, with the lens positioned at 30 / 36 degrees elevation and aimed 1.8 units ahead at a height of 1.8. The player remains in the lower third; the clock, plunger and two desktop exhibit fronts are now visible together. Follow still avoids head bob and automatic yaw. Neutral tone mapping, a 0.85 hemisphere fill and exposure 1.18 keep cream and coral brighter; faithful screen textures bypass tone mapping.

The promenade is one triangulated capsule union. Separate overlapping discs looked like cracked paving even after shadow adjustments, so they were removed rather than disguised. Character feet meet the single continuous surface. Static architectural shapes are instanced, while supported screens, hinged leaves, the carousel, plunger and anonymous character retain purposeful independent transforms.

Small interaction choices preserve the feel: a short walk on the same path goes directly instead of detouring through a graph endpoint; hover changes the cursor and adds a restrained coral edge; crossing the drag threshold consumes release. On phone, the right orbit gesture preserves simultaneous left-thumb movement. Opening a preview clears all held input and freezes the exact player/camera state; closing restores the actual initiating canvas or route link without resuming locomotion. Deliberate walking continues to schedule frames under reduced motion, while ambient movement remains still.

On WebGL failure, the illustrated ground plan keeps a centered live clock, Again, press count, a discoverable crown and real archive links. Movement hints, thumb controls and travel actions disappear. The route keeps direct preview links, and the conventional archive stays complete. Version labels are restored when representative hero cards return to their shelves; the world does not replace them with show names.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the final desktop, 390 px and 320 px captures against this spec. The back-facing round-headed figure, continuous cream promenade, tall clock gate and coral plunger establish a navigable place. The desktop first view includes two supported exhibit fronts. Phone framing concentrates on the player, clock and reachable reset court rather than shrinking every pavilion into the initial viewport; the compass and ordinary archive continuation keep the rest available. Four restrained matte colors and clean facets carry the requested low-poly language. The supplied archive continuation captures show a complete, deliberately conventional cream/green/coral archive that offers an equally visible browsing route.

**Code-reviewed feel:** Input distinguishes a 6 px mouse/10 px touch orbit from activation, clears held movement on cancellation and preview opening, and snapshots the exact camera/player pose for restoration. Direct route links make walking optional. Reduced motion still schedules deliberate locomotion while omitting ambient choreography. These are source observations; the root interaction checks, not these stills, establish successful movement and preview restoration.

**Fidelity decision:** Accept the deliberately simpler sculpture-like world over the reference's realistic vegetation, ornamental detail and noisy miniature surfaces. Preserve continuous paths and recognizable pavilion operations before adding props or copy. Faithful screen textures are intentional. No remaining P0/P1/P2 visual defect was identified in the supplied final compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.

## Runtime review follow-up — 2026-10-02

Review found four straight promenade connections crossing expanded pavilion colliders, including the shortest route from spawn past GoT. Those paths now visibly bend around GoT, Dexter, Sherlock and House of Cards. The navigation graph is built after all props exist, excludes obstructed segments using the walking clearance, and requires a clear approach from the player's current position. An unreachable click cannot start a blocked route. Static execution of the source pathfinder and movement equations completed 3,828 routes between every node, edge midpoint and all eight spawn/travel poses at 60 Hz, 30 Hz and 50 ms steps without collision or stalling. All 23 authored edges are clear; the continuous promenade retains three court holes. These are geometric and source checks, rather than additional visual captures.

Direct travel now focuses the canvas before hiding its initiating button, so the next movement key works without an extra click. A lost WebGL context clears held input and turns the existing route drawer into an always-visible seven-show preview grid plus Archive. The genuine links keep their preview and modified-click behavior; all thirteen original cards remain below, with no cloned cards or nested interactive controls. The fallback transfers focus away from hidden travel controls and omits movement hints and unavailable travel actions.

The spec now distinguishes the verified 48-degree framing, lighting and responsive settings from rendering budgets and frame-rate targets. Device performance figures remain targets to profile.
