# Architecture audit: three material sculptures

Prepared 2 October 2026 after the user rejected all seven non-Fair implementations. This is a replacement architectural proposal, not acceptance of the existing renders. The Fair is outside this audit and must remain intact.

Inspected the original reference JPG, latest material desktop capture, current module, `GUIDE.md`, `CONTRACT.md`, and `exhibition.js` for each direction below. The original image governs composition and the relationships between materials. A superficially similar palette does not pass.

## Shared failure and replacement seams

The current runtime makes a conventional gallery the master representation, moves three HTML cards into a hero, and projects upright HTML rectangles onto scene points. `pin()` follows neither a surface's perspective nor its occlusion. The modules consequently build frames around predetermined HTML rectangles. This reverses the design process: the website determines the sculpture, rather than the sculpture determining where an action or archive belongs.

The current contract explicitly requires three DOM mounts, an archive of `.shelf/.grid/.card` beneath the hero, native upright clock surfaces, and native page framing except for the Fair. Those constraints need replacement. Adding normal maps, reflection strength, corner folds, or another orbiting prop to this foundation cannot recreate any of the three references.

Replacement seams:

1. **Scene is the visible composition; archive data is the source of content.** Parse actual show/version records once, then pass data and genuine anchor handles to a concept. Do not move three special cards or create return placeholders. Every one of the 13 currently surfaced preview records gets a modeled exhibit and a semantic equivalent. The Dexter timeline and collapsed variants retain real destination links too.
2. **Semantic actions are independent of their visual representation.** The timer, tally, reset, status, home, theme choice, and archive anchors remain native and usable, but may form a visually clipped semantic twin while the healthy scene is active. Focusing an anchor frames and visibly outlines its corresponding object. Graphics failure restores the illustrated native archive immediately. This is the same principle already established by the accepted Fair, not permission to remove semantics.
3. **Surface-bound graphics replace upright DOM pins.** Closed screenshots are actual unmodified archive stills mapped onto the flat inner face of a modeled paper or recess. Numbers mirror the shared reel model in bounded dynamic textures on actual 3D reading surfaces. Labels are ink on those surfaces, not free-floating HTML. Clock geometry, printed numbers, caption, and hit proxy share the same transform hierarchy. Never maintain a second timer or tally.
4. **Picking and focus use registered scene objects.** Register semantic ID, visual target, enlarged hit proxy, focus pose, and reading surface corners together. Hit proxies are invisible and cast/receive no shadows. Click intent is distinct from drag intent. Touch cancellation, lost capture, blur, graphics loss and modal opening all release gestures. A hovered photo gets its existing real URL through a native anchor overlay if needed for modifier/middle-click semantics; that temporary overlay follows the true flat image face, rather than redesigning the object into an upright rectangle.
5. **Each concept owns its camera/navigation grammar.** These three are macro/editorial still lives, not another third-person game. Use authored camera rails and resting poses tied to actual scene topology. A scroll proxy can map ordinary wheel/touch scroll to the rail while a fixed canvas renders the installation. It is an input adapter, not visible HTML shelves. Keyboard focus and direct exhibit selection frame the same targets. Under reduced motion, select resting poses immediately without interpolated travel.
6. **The live preview remains the genuine archive page.** Deliberate activation frames a flat aperture or paper face, then opens the existing readable, focus-trapped iframe. If perspective remains, project all four corners and fit a true plane transform; point pinning is insufficient. If the original composition requires a strongly curled photograph, approach its flat central image face, never distort a website over the folded border. Keep Escape/close, modified/new-tab behavior, viewport-aligned origins and exact pose/focus restoration. Preview legibility takes priority over theatrical camera movement.
7. **Author assets before writing effects.** Provide each concept with a static scene asset manifest and authored volumetric meshes, coherent scale, pivots, UVs, material slots, camera poses, hit proxies and morphology names. A GLB can be authored/exported offline and served verbatim; the site still needs no build or framework. A procedural mesh is acceptable if it actually supplies the required silhouette and structure. A photograph on a slightly displaced plane is not a wax canyon or a tree.
8. **Loading is an explicit state.** Load geometry, textures, fonts and required closed-exhibit stills before promoting the scene. Keep a complete illustrated native view meanwhile. Warm placeholders must not hide missing assets as successful artwork. Show the ready composition in one short fade, preserve current state, and never begin with exposed primitives or a blank surface. Dispose asset ownership, texture atlases and animation buffers on teardown.

Asset production and visual acceptance are separate from runtime engineering. Baking AO/normal maps and exporting authored mesh levels is an offline authoring workflow, not a browser/site build step. Models must be original or license-compatible. Image generation can help create microscopic surface maps or fallback art; it cannot produce navigable geometry, valid morph targets, consistent UVs, or the physical relationships in a scene.

## Bubblegum Time — a connected tension sculpture

### Reference anchors and current failure

- The original clock strip is a continuous, translucent, stretched membrane with rounded aperture lips, thin bridges, radial tension at real metal pins, and a broad gathered neck into the enormous cropped upper-right bubble.
- Pale cylinders are visibly rotating mechanical reels inside the pink apertures. Their surfaces and glyphs share curved perspective. Cream cotton prints curl, twist and hang from the same pink system. Four different archives are visible in the original first composition, including Archer; a fixed three-mount adapter already loses this relationship.
- The implementation's pink slab has the topology of a rectangular appliance. Added tube folds read as strings drawn over it; the balloon is a separate opaque sphere; the rectangular numbers remain front-facing regardless of the belt. The prints are rigid HTML cards with physical curls added around their bounds. More gloss will not make those disconnected elements one membrane.

### Spatial construction and asset requirements

Author a continuous membrane, with four deliberately unequal rounded openings and a bulbous gathered neck. The surface has front and back thickness, stretched webbing near pin heads, broad tension folds, and a thinning gradient toward the bubble. It must survive a modest side view without exposing a paper cutout. Plan actual attachment topology before tessellation: two main steel pin anchors, a thick clock band, the bubble neck, and thinner tethers for four initial paper prints. The bubble can be a separate optical volume if its join is visually continuous and both pieces deform from the same driver; it must not appear to sit behind a flat slab.

Create a high-resolution sculpt for the silhouette/folds, then a clean runtime mesh with enough vertices around openings and neck to support bounded morphs. Bake small stretch wrinkles and compression marks to normal/roughness maps, not albedo highlights. Preserve smooth, broad reflective surfaces between folds. A rectangle with rounded holes plus TubeGeometry decorations is not an equivalent asset.

Each clock unit contains two cream rotating cylinders, a narrow central seam, an axle/end-ring assembly, and its own aperture occlusion. Drive cylinder UV rotation or rotation geometry using the existing `reelPlan`/`reelPosition` timing; the correct glyph occupies the actual cylindrical face. The drum, stencil and aperture must rotate/occlude together. A dynamically generated digit atlas is acceptable; an upright DOM numeral pasted in front is not.

Paper exhibits have thin real edge thickness, asymmetric corner curls, and a flat photo center. Screenshot, cream margin and caption belong to one paper mesh hierarchy. Give paper one string/pink attachment pivot and a distinct corner-flex morph. Main prints are authored individually; further prints may reuse two or three differentiated meshes without producing a repeated card pattern.

### Camera and archive grammar

Initial view is a low-perspective editorial camera: diagonal band across the center, large Severance upper-left, Dexter above/right of the clock, Game of Thrones lower-right and Archer lower-center. Crop the bubble and large black typography rather than shrinking them into complete icons. Keep the pin-to-band connection legible. The whole initial composition should feel slightly too large for the viewport.

Scrolling tracks along the same suspended gum network, with authored focal stops at successive branches of prints. There is no hero boundary and no shelf continuation. All 13 actual records are distributed across four hanging clusters; a cluster has an asymmetric hierarchy, never equal slots. Seasonal variants occupy neighboring prints on the same tether, with their short existing season labels. Direct semantic selection moves to that print. Backing geometry and actual front-face corners define the iframe approach pose.

On phones, author a portrait camera route around the same installation rather than applying unequal XYZ scaling to the desktop sculpture. Begin with a frontal, legible clock band; place a genuinely large print immediately below, then travel down the tethers. The bubble remains cropped. Preserve a recognizably thin membrane and curved cylinders, even at low detail.

### Material and lighting pipeline

Use one pink dielectric material family with spatial thickness: denser saturated clock lips, semi-translucent webs and a thinner inflated bubble. A baked thickness map controls attenuation/transmission; metallic sheen is forbidden. Clearcoat may supply the saliva-like highlight, but the pink diffuse body must remain visible. Use authored broad softbox reflections with dark gaps, a mint studio sweep receiving contact/shadows, and one large upper-left area-light approximation. Add a restrained right-side pink bounce. White reflection bands should stretch around the gathered neck and apertures rather than appear as generic sphere spots.

Paper remains matte cream with visible fiber only at close distance; steel pins supply narrow neutral highlights. Shadow/contact makes attachments convincing without casting a dark duplicate of the whole band. No baked highlight in the gum albedo, uniform all-over noise, random rainbow iridescence, or full-screen bloom.

### Motion and interaction model

Use an authored deformation field, not simulation for its own sake. Membrane vertices have weights for fixed pin groups, rigid drum neighborhoods, bridge stretch, bubble neck and paper tethers. Pointer dragging unoccupied gum pulls the relevant free region; the deformation propagates as a slow tension response. Drums remain rigid and paper image centers remain readable. Bound displacement and release to one damped overshoot. At rest, there is no jitter or perpetual toy bounce.

Again is a joined droplet/pad. Pending compresses it; confirmed success propagates a tightening wave from that pad through the four bridges to the bubble, which inflates once and relaxes. Its neck and the belt visibly share this breath. A remote reset is a much smaller pressure pulse. Failure releases pressure with no success breath. Exactly one crown is caught beneath a lifted gum curl; focus opens the curl without making it necessary for navigation.

### First asset gate

Before wiring a reset, render the authored membrane and one real paper exhibit from initial, 15° side, and portrait views. Reject straight slab edges, detached cords, a balloon that does not join the band, or a front-facing rectangle masquerading as a cylinder. Confirm broad moving highlights over actual folds, a flat readable photo center within curved paper, and material separation between gum/paper/steel. Only after those pass should the rest of the archive and gestures be mounted.

## After the Flame — inhabiting a macro wax landscape

### Reference anchors and current failure

- The original has deep perspective: a cropped tall candle mass on the left, a floor of poured wax converging through the center, elevated eroded archive terraces on the right, and burgundy void above. Large wax folds and thin translucent hanging sheets determine the silhouette.
- The clock tiles are part of a continuous foreground formation. Again is a shallow finger pool melted into the floor. All display apertures belong to the canyon; they are not independent picture frames.
- The current photograph-on-relief approach superficially preserves composition but prevents scene lighting or camera perspective from describing the canyon. New tube frames sit in front as conspicuous pastry rims and the added clock faces do not belong to the photographed depth. The module even relies on the picture for its left candle. Emissive photographed lighting plus real directional lighting creates two incompatible illumination systems.

### Spatial construction and asset requirements

Author the canyon as actual volumetric terrain. Establish a large connected base mass, a left taper/candle wall, and three right stepped terraces. Sculpt pooled streams, collapsed sheets, wax banks and inset reading cavities as part of that mass. Negative space and occluding banks must exist in geometry. Use a small set of separate thin drips and molten films only where they have real physical roots in the mass. A displaced image plane, arbitrary cylinders, or identical rounded frame rings fails the brief.

A high-resolution sculpt is the practical route. Remesh/decimate to runtime levels while retaining the silhouette and major drips; bake finer pores, ash and microfolds into matched normal/AO/roughness/thickness maps. Export clear material regions for cold porous wax, warm semi-translucent thin wax, molten wet wax, charred wick and metal crown. Static runtime assets can be loaded in Three.js without introducing any site build step. An implicit-surface generator is viable only if it authors these same cavities, banks and tapered sheets deliberately; a random collection of metaballs is not a substitute for art direction.

The clock's four physical tile surfaces sit inside one sculpted foreground ridge at staggered depth. Their masks follow genuine cavity silhouettes; they can be planar reading surfaces with ink-like dynamic reel textures, but their frame and the terrain share lighting and contact. Give cavities sufficient flat safe area for every real digit state. Caption strips are pressed/printed into wax beneath real screenshot cavities. Add exactly one crown in a foreground crease, with a visible tiny edge at rest.

### Camera and archive grammar

Use a low macro perspective camera, not a frontal orthographic plate. The first resting composition preserves the candle crop, open dark ceiling, rising archive terraces and foreground ridge. Keep background geometry dark enough to preserve the burgundy negative space; the image's drama depends on that void.

A shallow camera rail advances around the central poured-wax channel and past further recessed archive cavities, never through collision tunnels or behind opaque walls. All 13 faithful exhibits occupy uneven terraces along this continuous miniature terrain. The three initial exhibits maintain their reference hierarchy; the subsequent ten use varied recess sizes, height and contact rather than stacked identical wax cards. Native scrolling maps to the rail. Focusing a semantic exhibit frames its cavity, and preview activation approaches until the real flat screen can fit legibly. Clock/action remain available from a direct focus route even if the camera has moved down the canyon.

The phone route uses tighter editorial crops of the same actual landscape: first the timer/action with candle edge, then the first large recess, then a climbing terrace sequence. Keep meaningful wax in front/behind the screen, rather than shrinking desktop scenery around a two-by-two HTML timer. A low-detail mesh retains the silhouette and primary occlusion.

### Material and lighting pipeline

Cold wax has a creamy matte body, sparse surface pits, dark ash embedded in select channels and warm internal edges. Molten streams are visibly smoother, with narrow streak highlights. Thin drips need thickness-dependent warmth; use a thickness-map transmission/attenuation approximation or a bounded custom subsurface shader. This is not full volumetric scattering and should not be described as such. The same geometry must look plausible with the flame turned off.

The flame is the local light source: a tapered, articulated wick plus a bounded flame shader/billboard seen close to head-on. Its point light establishes warm pools on nearby wax; a broad dim warm key can support readable archive/clock surfaces. A cool rear-right rim defines thin distant edges, with very little burgundy fill. Generate the reflection environment coherently from these sources, rather than retaining photographed specular highlights in an emissive canyon. Bake AO only into creases/contact and keep it independent of albedo. Avoid dark duplicate rims, plastic beige clearcoat across cold wax, or gratuitous global bloom. Tiny flame halo is local and can be dropped on phones.

### Motion and interaction model

The main landscape is still. The flame has small correlated shape/light motion, never independent random flicker. Pointer proximity bends its tip slightly; flame touching is decorative and does not reset.

Again is a concave physical wax pool with a surface inset/press response. Pending locally deepens it without changing the canyon or digits. On confirmed success, a few molten films contract uphill into the candle: animate authored drip morphs or a surface-space flow mask following actual channels, not free-floating TubeGeometry strands that appear and disappear. The melted wick/candle tip can visibly recover a small amount. The event reads as reversed melting and settles back to the fixed resting terrain; no infinite mesh growth. Failure restores the pool only. A remote change gives one small flame pulse. During a preview, suspend decorative motion at its exact visible pose.

### First asset gate

Approve a clay render from initial, slight side, and phone cameras before surfacing textures. The wax mass must already read as the original canyon: left crop, channel floor, rising right terraces and integrated cavities. Then light it with the flame key and cool rim. Reject any asset requiring baked photographic perspective to look deep, detached pastry frames, freestanding clock widgets, or identical tentacle drips. The scene must survive camera motion without projection seams before archive navigation is implemented.

## Not Yet Ripe — a real specimen branch

### Reference anchors and current failure

- The original branch is gnarled, diagonal and foregrounded, with curling stems and large cupped leaves that overlap different depths. Four vertically split citrus specimens are pointed, uneven, juicy and distinct; their segments and pith follow elongated anatomy, not a radial coin wheel.
- Archive prints have strings/hole edges and curl as real specimen papers. A split irregular reset fruit lower-left creates a second botanical shape. The large black edge typography and faint botanical drawing field create an editorial plate rather than a tropical UI.
- The current foreground rod contradicts its photographed bark. Repeated oval skin/torus constructions plus radial cut-face textures read as scalloped medallions. Identical fruit, straight stem placements and perfectly face-on numerals destroy botanical specificity. Procedural vein planes do not reproduce the folded translucent leaves; rectangular papers remain website cards with giant wall shadows.

### Spatial construction and asset requirements

Build an actual gnarled branch with tapered cambium ridges, scars, knots and curved attachments. Its primary diagonal, right upward curl and lower-left offshoot are authored composition, not an arbitrary TubeGeometry spline layered over a picture. Four clock fruits have individually sculpted pointed longitudinal profiles, unequal cut lobes, different pith thickness, visible central seams and sparse seeds. These are cut lengthwise specimens, not four ellipsoids with circular torus rims.

Create two or three botanical fruit base sculpts and instance only the non-defining anatomy where appropriate; the four main fruits need individual silhouettes. Flesh is a shallow volumetric relief of elongated sacs, opaque ivory pith and semi-translucent interiors. It need not be millions of modeled vesicles: a few authored segment masses/unequal membranes supply depth, with correlated normal/thickness maps for fine sacs. Preserve juice near lower tips rather than making the whole peel glossy. Live number textures lie on a safe central flesh region and inherit the cut plane/fruit transform. They are dark printed specimen numerals; those regions stay legible through ripeness transitions.

Author several cupped, folded and curled leaf meshes with a real central vein/edge silhouette; finer veins are mapped. Attach with stem pivots and transmission thickness maps. Primary leaves have independent poses; use instances for distant small foliage. Papers have real thread, punched hole, stained cotton edge and limited corner curvature, with a flat genuine screenshot face. The reset fruit has a wide concave opening and differentiated split lobes; it cannot reuse the timer medallion as a big round button.

### Camera and archive grammar

Use a slightly perspective specimen camera so branch, fruit, leaves and tags occupy distinct depth layers. Preserve the diagonal woody arc, four hanging longitudinal fruits, two opposed paper heights, lower-left reset and cropped edge type. Faint line drawings belong to a distant paper/wall surface; they must not supply the missing plant geometry.

Extend the authored branch into a winding installation above/below the initial view. Every archive record hangs as its own paper tag; seasonal variants cluster naturally at one fork. Native scroll follows an authored camera path up the branch, with occasional lateral changes that expose the next tags. No repeated `.shelf` section heading or equal photo grid. Real tags are readable at rest and large enough to target, even when a leaf frames their edge. A visible curled leaf is a courtesy interaction; it never hides the only route to a preview.

On phones, follow one climbing branch with portrait resting poses. Clock fruits may be arranged in two naturally staggered pairs if necessary, but remain the same individual specimens; do not flatten/narrow their anatomy with disproportionate group scaling. Place a full-size archive paper immediately after the first timer/action view. All 13 records and extra destination links remain reachable by focus or direct selection without precision gestures.

### Material and lighting pipeline

Use actual scanned/licensed or authored botanical map families: bark albedo/normal/roughness with no baked sun, peel pore normal plus mottled color masks, flesh thickness/roughness and subtle moisture, leaf albedo/normal/transmission, cotton paper grain. Pore grain is microscopic; branch ridges, pith, seams and leaf cupping must already exist as macro geometry. Bruises/scars are authored masks, not evenly spread procedural noise.

A warm upper-left broad source makes coherent diagonal shadows across a pale chalk specimen sweep, with a restrained cool green fill. This can use one tight shadow-casting light plus baked/local AO; it does not require costly path tracing. Leaves and flesh catch transmitted warm edges, pith and paper remain opaque/matte, peel remains mostly dry. Shadow density must communicate depth without giant cutout silhouettes dominating the background. No photoreal plant image layered behind low-detail rods, fake painted highlights, candy peel metalness or universal clearcoat.

### Motion and interaction model

Hierarchy matters: main branch flex is small, twigs lag, leaves roll/flex, paper follows its string pivot then its corners. Different response rates create the feeling of a living specimen; applying a sine wave to every object does not. Stop the selected tag and neighboring leaf movement on focus. Pointer movement can attract one bounded bee, but it must leave the pointer/target region and must not imply another puzzle or secret.

Again presses the split fruit rim. Only confirmed success drives an uneven green ripeness front along actual peel masks and extends/retracts one authored branch tip. This is bounded un-ripening; flesh and screenshots remain unchanged. Pending cannot change ripeness. Failure releases the rim. A remote update produces a small local leaf response, not a repeat of the whole reversal. Exactly one folded leaf near the clock holds the crown; opening it on focus/touch reveals the existing phrase with no dependency on the bee, countdown state or navigation.

### First asset gate

Approve a clay render of the actual branch, four anatomically distinct cut specimens, reset fruit and two leaf types before preview integration. Then inspect bark, peel, pith and flesh in a single lit close crop. Reject a smooth rod, repeated scalloped oval/torus silhouettes, perfect radial wheel faces, billboard leaves or fake photographic background bark. A slight camera change must create coherent depth between branch, fruits, leaves and paper while keeping the numerals readable.

## Acceptance sequence and honest limits

1. **Silhouette blockout:** compare reference and clay render at the same frame. Confirm mass, negative space, physical joins, viewing angle and initial exhibit hierarchy. Materials cannot rescue a rejected blockout.
2. **One polished object assembly:** complete one timer opening plus one genuine archive exhibit in its actual material world. Prove lighting, surface-bound numbers, screenshot mapping, selection/focus and preview approach. Do not stamp thirteen unfinished copies.
3. **Full initial frame:** reproduce the reference's major material relationships and intentional cropping. Side-by-side judgment is strict; declaring a cleaner or simpler interpretation does not answer the user's request.
4. **Navigation extension:** add all real records to the same physical installation and author portrait camera stops. Test scroll/touch cancellation, keyboard routes, actual archive preview, focus return and scene recovery.
5. **Choreography:** wire local confirmed success, remote, pending, error and repeat interruption to bounded material behavior. Reduced motion chooses immediate useful poses and real values; it must not remove an action or hidden discovery.
6. **Failure and resource checks:** hold the complete illustrated native scene during asset loading, restore it on asset/graphics failure, stop hidden rendering and dispose owned resources. Functional checks do not constitute visual acceptance.

There is no need for React, a physics backend, real-time fluid simulation, cloth solvers, multiplayer avatars or a new counter service. There is a real need for authored geometry and a rendering contract that permits it to determine composition. If suitable volumetric assets cannot be produced, record that as an asset gap and retain the concept reference; do not label a backdrop-and-widget replacement polished or faithful.
