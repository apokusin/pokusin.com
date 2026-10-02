# The Almost Fair

New exploration 6; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![The Almost Fair visual reference](../references/the-almost-fair.jpg)

### Premise

A fairground is ready for its grand opening, but visitors can always postpone it another month. You explore the archive by walking a small anonymous figure through seven exhibition pavilions. The shared countdown is the fair’s enormous clock gate; “Again” is its comically oversized postponement plunger. Nothing must be unlocked, won, or completed. The pleasure is inhabiting a gently absurd place and discovering the real sites within it.

### Art style and composition

Use a 38 × 30 unit architectural diorama with a figure-eight promenade and central clock court. Paths are at least 2.4 units wide, with step-free shortcuts. Spawn facing the clock and two accessible exhibitions. Foreground forms, the central landmark, and a distant pavilion establish depth. Keep buildings under 2.8 units; the clock reaches 5.2. Rounded geometry and planes coexist without outlines, texture noise, or clutter. The fair is one continuous place, with distinct pavilions.

The image establishes the player → branching path → central clock composition. Its photographic grain, realistic clouds, trees, ornamental horses, tent scallops, stairways, and large decorative crowns are incidental generation details: remove them. Use a solid-color background, flat-color matte surfaces, simple faceted architecture, smooth shading only where intentionally rounded, and flush thresholds or shallow ramps. Retain exactly one small hidden crown. The specified pavilion-to-show mapping and mono clock typography take priority over the image’s swapped exhibit associations and serif numerals.

### Palette and typography

Use cream `#F2E5CC` for ground and 60% of architecture; jade `#77958A` for 25%; coral `#D86B55` for the reset landmark, character, and accents; charcoal `#263B40` for text and recesses. Artwork retains its colors. Use IBM Plex Mono for clocks and plaques; a small Archivo Black wordmark is the only second face. Show names appear nearby and in the route selector. Omit descriptions, badges, and progress metrics from the world.

### Geometry and materials

The character is 1.05 units tall: a smooth 12 × 8 segment sphere head, eight-sided tapered torso, and two small feet. No eyes, dialogue, costume selection, or avatar account. Matte materials use roughness 0.95 and metalness 0; crisp architectural facets contrast with its round head. Each pavilion gets a different physical operation: GoT’s pennant arcade has hinged reading leaves; Dexter’s coral tiled court places its episode timeline on a continuous waist-high rail; Sherlock’s narrow doorway opens onto two inclined desks; Archer’s carousel has a tiered roof and ground-level rotating display easels; Breaking Bad’s angular canopy shades two freestanding lecterns; House of Cards occupies one folded-plane pavilion; Severance’s jade arcade has two recessed terminals. Screens belong to these objects, with visible supports and reachable fronts. Preserve collapsed variants within each exhibit’s normal archive detail view.

### Camera and lighting

Use a 38° perspective follow camera, 6.5 units behind the character, 30° downward pitch, targeting 0.8 units above ground. The camera follows horizontal motion with a 120 ms critically damped response and no head bob. Dragging rotates the yaw; pitch remains between 20° and 45°. Low architecture and camera collision prevent prolonged obstruction; compress distance toward 3 units before any wall intersects the view. A warm directional key comes from upper left at roughly 45° elevation, paired with a cool hemisphere fill. Start key intensity at 2.2, fill at 0.6, exposure at 1.0; judge final values by readable charcoal recesses and retained cream highlights. No HDR environment, lens flare, bloom, fog, or auto-exposure. Use one 1024² soft shadow map centered around the player, plus inexpensive modeled contact occlusion.

### Interaction contract

Desktop supports WASD/arrows, click-to-walk on the clearly bounded promenade, and pointer drag to orbit. Capture movement keys only while the focusable world surface has explicit focus; ordinary page scrolling, controls, and overlay inputs retain their keys. A persistent compass button opens a DOM route selector containing all seven exhibit anchors, regardless of distance. Keyboard users can Tab through those links and activate any preview without walking. Near an exhibit, its physically aligned preview target and show name appear as an additional shortcut. Selecting a preview opens the existing scale/fade HTML overlay; retain modified-click behavior. Freeze locomotion, release movement-key capture, and save position, yaw, camera distance, and selected exhibit; closing returns that exact pose and restores focus. The route selector also offers direct travel, with no map covered in pins. On phone, one left thumb pad handles motion, right-side drag turns the camera, and tapped previews open normally. The first action hint is only “Walk · drag” on desktop or two gesture icons on phone, disappearing after successful movement.

The plunger performs the existing shared POST. It depresses while pending, then physically rewinds the clock drums and rolls the press tally only after success. A 429 or network failure returns it to rest, presents the existing brief status, and changes no clock or scenery. A newly observed remote press produces only a small clock response and no full local ceremony, without moving the visitor or claiming another player is present. Hold the clock crown for 700 ms to reveal the sole added easter egg, “Long may I count”; keyboard activation reveals it too.

### Motion choreography

Walk at 3.0 units/second, reach that speed in 150 ms, and turn the body toward movement over 180 ms. Feet alternate 6° without squashing the head; idle breathing is a 0.015-unit rise over four seconds. Exhibit leaves open 12° over 280 ms on approach and return over 400 ms. The carousel advances only when deliberately touched: 60° in 900 ms, then settles. The plunger depresses 140 ms during the request and rests there until the response. After success, real reels spin for 1080 ms per digit with 45 ms column staggering (about 1.4 s overall); after a 180 ms hold, the plunger releases in 240 ms. Concurrently, seven roof pennants dip together 8° and return over 650 ms. The brief ceremony ends within 1.4 s of confirmation; normal ticks queue during the reel spin. Never play fireworks or a full-world spin. The interrupted opening ceremony is a small visual joke, not an alert.

### Effects and render budget

Budget 70,000 visible triangles, 80 draw calls, eight instanced architectural groups, one shadow-casting light, and no physics engine. Ambient occlusion comes from vertex darkening in creases and soft alpha contact patches under walls, wheels, and the player: approximately 12–18% darkening, never black outlines. No mandatory screen-space AO pass. Cap pixel ratio at 1.5 desktop and 1.25 phone; target 60 fps and permit 30 fps on weaker phones. Decorative props update only near the camera. Use accurate low-resolution preview textures for up to eight visible mounts; mount only the focused live iframe in the HTML overlay. Pause the renderer when hidden and dispose resources on theme exit.

### Responsive and fallback behavior

Portrait framing moves the camera to 7.5 units and 36° pitch, preserving the player and next reachable landmark. Touch controls have 48 px targets and respect safe areas. Reduced motion freezes breathing, pennants, and approach animation; digit values update immediately, direct travel cuts, and camera follow has no easing. User-requested walking and orbit remain available. A persistent accessible “Archive” control opens the conventional static archive, preserving the selected show. WebGL failure uses an illustrated ground-plan image with ordinary show links, the real HTML countdown/button, and the existing preview overlay. The visitor can reach every version without movement skill or 3D support.

### Implementation boundaries

Build an optional theme using the generator, archive content, vendored Three.js, digit reels, and shared API. Add no build step, React dependency, multiplayer, accounts, inventories, autoplay, or new server-side state. DOM elements provide labels, focus, clock values, status, and preview links; geometry provides movement. Capsule-versus-box collisions and hand-authored walkable paths suffice; click-to-walk follows their connections rather than crossing props. Archived sites stay faithful. Keep position in memory or session storage; the countdown remains the only shared state.

### Fidelity checks

At first spawn, a reviewer must identify the player, clock, reset plinth, reachable path, and at least two exhibits without instructions. The seven pavilions must differ in silhouette and display operation, while sharing the same four-color material language. Archive mounts must be supported objects rather than floating UI. Entering and closing a preview must preserve pose and focus. Confirmed reset must affect the real shared deadline; failure must leave it unchanged. Phone navigation, keyboard direct access, reduced motion, and WebGL fallback must each reach every show. Reject additional HUD panels, quests, scenic plants, mascot facial features, glossy materials, and any copy needed to explain the joke.
