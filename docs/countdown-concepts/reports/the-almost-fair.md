# Art direction review — The Almost Fair

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
