# Still Drawing Tomorrow

New exploration 4; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Still Drawing Tomorrow visual reference](../references/still-drawing-tomorrow.jpg)

### Premise

Tomorrow exists as an unfinished animation drawing. Pressing Again erases the finish and starts another pass. This is a sunlit animator's worktable with translucent cels and graphite, distinct from a broadcast monitor wall. Archive work lives in the sheet stack; movement explains the joke with very little copy.

### Art style and composition

Preserve the overhead worktable, uneven archive cels across the top, large four-part clock cel in the middle, eraser lower-left, and hand-drawn running cycle curving across the lower surface. Layer depths matter more than ornamental props. Remove generated margin slogans. Continue through tabbed, overlapping sheet groups without turning the page into a conventional gallery below a hero.

### Palette and typography

Paper `#F3EEE4`, graphite `#25231F`, pencil red `#D94B32`, registration blue `#3154B8`. Use a condensed sans for digits and a restrained handwritten face for identity/title; maximum two families. Again may share the digit face. Preserve show/version labels and D/H/M/S. Keep registration marks visual rather than adding diagram instructions.

### Geometry and materials

Paper is matte with baked fiber detail and shallow bent edges. Acetate cels use thin translucent planes with Fresnel highlights, low-opacity reflected light, and localized curled corners; avoid stacked full-screen transparent meshes. Small eraser chips and worn graphite strokes give scale. DOM screenshots and reels sit on planar cel regions; never embed invented mock imagery in a texture atlas.

### Camera and lighting

Use an orthographic near-overhead camera with slight tilt, not a rotating studio tour. Key/fill/rim around 1:0.45:0.1: broad upper-left daylight, generous white room fill, delicate acetate edge highlight. One soft shadow map or baked layer shadows defines sheet separation. No bloom, neon, CRT scanlines, hard vignettes, or aggressive depth-of-field blur.

### Interaction contract

Cursor leaves a short graphite trail that fades within 700 ms; keyboard focus gets an equivalent small pencil underline. Hover or focus separates the top few cels, revealing tabs. Tabs are usable show anchors, and the selected sheet opens the existing preview. Again compresses the eraser while waiting. Only POST success sweeps away the finish mark and redraws its extended path. Errors restore the eraser; remote updates advance one understated sketch pose.

### Motion choreography

Illustrated runner and pencil lines use intentional 12-pose-per-second stepping. Navigation and overlay transforms remain smooth. Changed digit reels take 420 ms; success spins them for 1080 ms per digit with 45 ms column staggering (about 1.4 s overall), with brief red/blue onion-skin ghosts kept outside the live numerals. Erasing lasts 600 ms; redrawing follows over 900 ms. Camera and scroll position remain under visitor control.

### Effects and render budget

Start below 50k triangles and 55 draw calls, with at most six overlapping translucent cel regions. Use authored stroke paths plus shader reveal masks, not real handwriting recognition. Cap DPR at 1.5 desktop/1.25 mobile; cel textures at 2K. Target 60/30 fps. Disable reflected acetate and pencil debris first. Suspend animation offscreen and while hidden.

### Responsive and fallback behavior

Mobile keeps one large clock sheet, eraser directly below, and an edge-tab stack with full-width selected previews. Reduce props and layers rather than shrinking all labels. Touch can lift a corner through explicit activation; no core hover-only behavior. Reduced motion freezes runner, disables graphite trails, and applies numbers immediately. Fallback uses paper/cel art layers with working DOM previews and anchors.

### Implementation boundaries

Static generated markup and vendored Three.js; do not introduce a framework build. Preserve archived files and existing overlay behavior, including Esc and modifier-click. Actual shared values drive reels. One pencil-drawn crown hides beneath a lifted cel corner; accessible activation reveals Long may I count. Keep the crown as the only textual secret.

### Fidelity checks

The table must feel made of paper, pencil, and acetate, with the broad clock sheet as a drawing in progress. Reject scrapbook sticker overload, toolbar chrome, explanatory margin notes, or a television effect. Check erased finish/redrawn extension after success, failure recovery, cel hit targets, keyboard tab order, responsive stacking, and truthful accessible numbers.
