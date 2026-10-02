# Still Drawing Tomorrow

New exploration 4; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

Art direction refinements are documented in the [review report](../reports/still-drawing-tomorrow.md) and incorporated below.

![Still Drawing Tomorrow visual reference](../references/still-drawing-tomorrow.jpg)

### Premise

Tomorrow exists as an unfinished animation drawing. Pressing Again erases the finish and starts another pass. This is a sunlit animator's worktable with translucent cels and graphite, distinct from a broadcast monitor wall. Archive work lives in the sheet stack; movement explains the joke with very little copy.

### Art style and composition

Preserve the overhead worktable, uneven archive cels across the top, large four-part clock cel in the middle, eraser lower-left, and hand-drawn running cycle curving across the lower surface. Layer depths matter more than ornamental props. Remove generated margin slogans. Continue through tabbed, overlapping sheet groups without turning the page into a conventional gallery below a hero.

### Palette and typography

Paper `#F3EEE4`, graphite `#25231F`, pencil red `#D94B32`, registration blue `#3154B8`. Use a condensed sans for digits and a restrained handwritten face for identity/title; maximum two families. Again may share the digit face. Preserve show/version labels and D/H/M/S. Keep registration marks visual rather than adding diagram instructions.


The implemented font pair is **Barlow Condensed + Caveat**. Barlow Condensed gives the graphite-textured live clock and small archive/header/menu/status/footer labels one legible condensed face. Caveat supplies the hand-lettered title, eraser action, drawn tally, archive continuation and hidden line. Caveat is self-hosted as a variable font with its OFL license under `countdowns/assets/concepts/still-drawing-tomorrow/`; remove platform-dependent Bradley Hand/Segoe Print, Impact and Georgia from selected UI styling. The authored graphite texture remains clipped inside the real live glyphs.

### Geometry and materials

Paper is matte with baked fiber detail and shallow bent edges. Acetate cels use thin translucent planes with Fresnel highlights, low-opacity reflected light, and localized curled corners; avoid stacked full-screen transparent meshes. Small eraser chips and worn graphite strokes give scale. Author twelve deliberate runner poses, finish-stripe strokes and erase/reveal masks; a bouncing dot cannot replace the runner. Limit transparent overlaps to the authored cel regions rather than adding full-page glare. DOM screenshots and reels sit on planar cel regions; never embed invented mock imagery in a texture atlas.


The implementation authors paper fibers, registration marks and twelve runner poses as bounded canvas textures, plus a local `graphite-ink.svg` surface clipped inside real live digit glyphs. These textures contain no fabricated countdown or archive data. Cel geometry curls physically; two separate semantic corner controls lift their sheets on touch or keyboard without opening the archive preview. Rounded eraser geometry and pencil shafts provide actual shallow depth.

### Camera and lighting

Use an orthographic near-overhead camera with slight tilt, not a rotating studio tour. Key/fill/rim around 1:0.45:0.1: broad upper-left daylight, generous white room fill, delicate acetate edge highlight. One soft shadow map or baked layer shadows defines sheet separation. No bloom, neon, CRT scanlines, hard vignettes, or aggressive depth-of-field blur.


The implemented orthographic worktable is a shallow XY arrangement viewed from `(0, 2, 24)` with a desktop vertical half-span of `max(6.8, 9.75 × height / width)`. This retains a minimum 19.5-unit horizontal field at narrow desktop/tablet aspect ratios, so the outer archive sheets and pencils remain inside the canvas. Phone framing uses a 7.4-unit horizontal field; its vertical span follows viewport aspect. The clock cel is scaled to 51% and its projected DOM width is explicitly scaled to match, preserving all four units at narrow widths rather than clipping them. Softer shadows and stronger registration strokes preserve a handmade surface without a camera tour.

### Interaction contract

Each sheet group exposes at least one named, protruding tab at rest; the archive must be visible before hover. Tabs remain ordinary show anchors, and the main rectangular preview opens the existing overlay directly. Hover/focus lifts a tab 6 px with at most two degrees of rotation over 180 ms, returning over 260 ms; it never moves the actual preview target beneath the pointer. A corner lift reveals another tab without also opening a preview. Touch and keyboard offer that same separate corner action. Movement pauses while a pointer or focus occupies a preview region. Cursor leaves a subtle graphite trail only on free paper, fading within 700 ms and never persisting as an editable drawing; retain the normal pointer. Keyboard focus receives an authored pencil underline. Again compresses the eraser over 100 ms and holds while waiting. Only POST success erases the finish stripe and redraws the same path beyond the runner. Errors release the eraser and retain the finish stripe; remote updates advance only one understated sketch pose. Preview close restores the same sheet/scroll position and focus.

### Motion choreography

At rest, the runner holds one pose before a finish stripe. A short unfinished idle loop occurs no more than once per twelve seconds on desktop; omit idle cycles on phone. Illustrated runner and pencil lines use intentional twelve-pose-per-second stepping with anticipation and hold poses. Navigation, cel lift and overlay transforms remain smooth. Changed digit reels take 420 ms; success spins them for 1080 ms per digit with 45 ms column staggering (about 1.4 s overall). Fixed red/blue registration strokes remain on the cel beneath the live glyphs; do not duplicate digits as animated ghost text or introduce a second timer model. Onion-skin pose ghosts belong to the runner path, where they explain the drawing process without muddying the clock. Red/blue is a registration convention, never error/success coding. Concurrently, a 600 ms eraser sweep removes the finish stripe; redrawing then extends its path over 900 ms. The runner advances toward the old finish and settles one pose short of the new stripe, making postponement legible without words. Camera and scroll position remain under visitor control.


The working runner uses authored graphite anatomy at roughly one world-unit scale, with darker stopped pose ghosts along the path so the trajectory is visible at rest. A bounded closed drawn path lets each successful reset move the finish forward without allocating more geometry. Cursor marks last no more than 700 ms. Corner lifts preserve preview positions and offer a dedicated touch/keyboard target.

### Effects and render budget

Start below 50k triangles and 55 draw calls, with at most six overlapping translucent cel regions. Use authored stroke paths plus shader reveal masks, not real handwriting recognition. Cap DPR at 1.5 desktop/1.25 mobile; cel textures at 2K. Target 60/30 fps. Disable reflected acetate and pencil debris first. Suspend animation offscreen and while hidden.

### Responsive and fallback behavior

Mobile keeps one large clock sheet, eraser directly below, and an edge-tab stack with full-width selected previews. Reduce props and layers rather than shrinking all labels. Touch can lift a corner through explicit activation, while a separate large preview region opens immediately; no core hover-only behavior. Keep visible edge tabs and a stable hit region when layers rearrange. Reduced motion freezes runner, disables graphite trails, and applies numbers immediately. Fallback uses paper/cel art layers with working DOM previews and anchors.

### Implementation boundaries

Static generated markup and vendored Three.js; do not introduce a framework build. Preserve archived files and existing overlay behavior, including Esc and modifier-click. Actual shared values drive reels. One pencil-drawn crown hides beneath a lifted cel corner; accessible activation reveals Long may I count. Keep the crown as the only textual secret.

### Fidelity checks

The table must feel made of paper, pencil, and acetate, with the broad clock sheet as a drawing in progress. Reject scrapbook sticker overload, toolbar chrome, explanatory margin notes, or a television effect. Check that a visitor can find and open an archive preview before discovering the corner trick. Verify visibly erased finish/redrawn extension after success, deliberate runner hold poses, pressure in the eraser, failure recovery, stable cel hit targets, keyboard tab order, responsive stacking, transparent-layer legibility, and truthful accessible numbers.
