# Still Drawing Tomorrow

**Status: authored scene-first candidate implemented; original-reference art gate pending.** The earlier non-Fair implementation was rejected and its acceptance remains withdrawn. The original image still controls composition/material judgment. See the [current art-director report](../reports/still-drawing-tomorrow.md), [implemented runtime audit](../runtime-audit.md) and [saved rebuilt evidence](../architecture/evidence/rebuilt/README.md). The Fair remains unchanged.

### Premise

Tomorrow is an unfinished animation drawing. Again presses a worn eraser into paper, removes the finish and draws it farther away. The archive inhabits real overlapping acetate folios.

### Art style and composition

Match the overhead warm worn table: unequal archive cels overlapping upper half; broad four-unit clock cel lower-middle; battered red eraser lower-left; anatomical hand-drawn runner looping below/right; registration holes, lower tabs and broad rolled corners. Keep real layer depths/unequal angles; pencils/cropped mug are secondary scale cues. One healthy viewport table contains seven folios; camera/folio selection explores them. Reject three equal scrapbook cards, conventional shelves, clean red button and stick-figure runner.

### Palette and typography

Warm paper `#F3EEE4`, graphite `#25231F`, red `#D94B32`, registration blue `#3154B8`. At most two families: source-matched tall condensed glyphs and consistent authored handwritten identity/tally. Barlow Condensed/Caveat require glyph/drawing comparison, not automatic reuse. Complete real digit atlas has graphite pressure variation and red/blue construction outlines; shared reels select/move glyphs. Native values remain immediate. Copy is names, D/H/M/S, Again and necessary real tab labels; no margin slogans.

### Geometry and materials

**Implemented candidate.** An authored overhead animation table carries four real graphite reel cels, runner loop, eraser Again, registering folios, pencils and wood shavings. Curved stock carries faithful stills and captions; actual individual works have fourteen camera stops rather than HTML shelves. Blender-authored thin stock/acetate curl, registration holes, rubber wear, wood and separate fibre/graphite/roughness maps now supply physical form. Runtime drawn ink moves with its UV-bound cel. Material/color improvements remain subordinate to true stock thickness and broad developed curls; extra transparent rectangles cannot substitute for acetate.

Follow the selected [Blender 4.5.14 LTS asset workflow](../architecture/assets.md), [composition/type anchors](../architecture/composition.md), [input ownership](../architecture/input.md) and [physical inventory](../architecture/INVENTORY.md). Editable Blender sources, reproducible Python exporters, static GLB bundles, named-node manifests and material maps now exist under the concept’s scene directory. They are implemented candidates; a successful export does not pass the original-reference art gate.

Author genuinely curled acetate/paper with subdivided developable surfaces, underside/thin edge, holes and separation from backing. Deliver optimized `.glb` where appropriate, editable source/reproducible authoring scripts, UVs and separate material maps/manifest. The pinned Blender 4.5.14 LTS runtime has been used for these authored exports. A displaced last-corner triangle is insufficient. Archive image and live ink share sheet UVs/deformation, never frontal HTML over a rotated cel.

Paper has plausible nonrepeating fibers/wear/matte roughness. Acetate has clear flat regions, local scuffs, broad coherent reflected window and rolled edges/contact. Bound transparent overlaps. Eraser has uneven worn rubber, rubbed macro patches, nicks, wrinkled fibrous sleeve and printed Again. Local bounded crumbs/shavings support actual wood/paint/lead pencils. Author finished twelve-pose anatomical runner, full graphite digit set/construction lines, finish masks and hand labels before coding motion. SVG/raster is correct for drawings; elementary canvas limbs/random noise are not. Never bake live dates/counts or invented work into art.

### Camera and lighting

**Current source gate.** A directional warm window should reveal paper fibres, broad corner curls and local registration/contact shadows against restrained cool fill. Rubber needs a worn matte edge, dirty crumbs and pigment, distinct from polished plastic. Avoid flat uniformly beige lighting and overly sharp stacked-sheet silhouettes.

**Target versus current settings:** the earlier key/fill/rim art target was 1:0.45:0.1; it is not a verified current light ratio. The active `.scene.js` uses directional key intensity 2.3, hemisphere intensity 1.05, no separate rim light, environment intensity 0.42 and exposure 1.35. Its raw key-to-hemisphere parameters are approximately 1:0.457, but hemisphere/IBL contributions cannot be treated as a measured three-light illuminance ratio. The retained legacy `.js` used 3.15:0.82:0.18. Judge the current raking fibre/curl response from the actual browser, independently of either parameter set.

Near-overhead orthographic or long-lens camera with small fixed tilt reveals sheet thickness; no orbit. Broad warm upper-left window, pale bounce and restrained diagonal mullion bands on free paper. Tight soft contact under eraser/stacks/curls; acetate reflects that same window. Transparent ink/cels do not cast opaque rectangle shadows. Reliable gloss/roughness/true curl precede optional refraction. No bloom, vignette, chromatic effects, sketch post-filter or universal glare.

### Interaction contract

The new scene uses the shared lifecycle/action host without inheriting a shared visual composition. Fourteen exact scroll stops cover the opening and all thirteen genuine versions. Five archive-page links, the Dexter timeline and external live Severance destination retain native href/target/rel semantics; keyboard focus synchronizes the requested surface and runway. Home, Worlds and Clock stay independently accessible.

Native wheel/trackpad and vertical touch scrolling follow the bounded runway through authored folio positions; exposed native/physical tabs select directly. Optional horizontal dragging on empty desk space is desktop-only and synchronizes the same runway state. Paper lips own their separate lift gesture; vertical phone movement remains native scrolling. Protruding show tabs bring folios into the open desk region. Layered version cels/tabs represent all 13 gallery works. Deliberate curled-lip lift fans version tabs without opening; activating an image opens the real preserved iframe. Close restores exact layering/camera/focus. Mesh hits mirror native semantics; focus frames/pencil-underlines objects. Real modifier/middle-click URLs remain.

Five More/archive links—GoT, Dexter, Sherlock, Archer, Breaking Bad—are lower paper index tabs to existing archive pages with theme preserved. Dexter's distinct film-strip tab opens its actual scrubber. Severance's outward-arrow tab opens its actual live site; LIVE remains only on its live work. Home/Worlds have sparse corner/native equivalents. No auxiliary link is trapped permanently under a sheet. Readable preview fits an approached aperture or shared modal.

Pending visibly presses the eraser into paper; error/429 releases it with real status and drawing intact. The sole graphite crown beneath a deliberately lifted cel has keyboard/touch reveal of Long may I count. Cursor graphite exists only on free paper, clipped away from work/action/number regions, and fades quickly. Preview, cancellation, blur and hidden page clear grabs/trails.

### Motion choreography

**Implemented motion contract.** Use discrete drawn poses rather than a generic spring. Lift/fan the actual stock with visible registration hinges, freeze exact curl/hover phase and graphite/pencil state for previews, and show a bounded erasing/redrawing ceremony only on confirmed reset. Reduced motion keeps final ink/state without camera or cel travel.

Mirror real reels: ticks 420 ms; reset spins 1080 ms/45 ms column offsets. Ink follows cel motion. Confirmed success slides eraser across finish, removes ink through a bounded mask, leaves a short rubbed patch/dust and draws a farther finish. Twelve anatomical runner poses advance and hold short of it. Connected erase/redraw must be visible in one composition; stationary button plus separate fade fails. Pending/error never advances the finish; remote changes one restrained pose. Corner/folio motion is smooth; drawn runner steps at twelve poses/sec. No unlimited strokes or phone idle loop.

### Effects and render budget

One renderer, bounded cel overlaps, real glyph/pose atlases, fixed ink masks/stroke buffers, one main shadow light and prefiltered window. Reduce props/ghost frames before defining runner/curl/graphite assets. Profile transparency/map/draw-call costs after material gate; no hardware FPS inferred from settings. Entry is immediately composed; render relevant motion/numerical updates and pause hidden. No handwriting engine, physics service or cursor particle fountain.

### Responsive and fallback behavior

**Portrait candidate.** The tabletop is recomposed in portrait, with all thirteen individual record stops available by touch scroll and exact native focus. The first real print is visible in the reviewed view. Validate D/H/M/S separation and tabs/route at 390/320; one first folio cannot stand in for the complete archive. The host recreates the authored profile when crossing 700px without a page reload, preserving native/shared state and normalized archive position; it defers that recreation until an open preview closes. Failure reveals the complete semantic/native archive.

Phone opens on broad readable clock cel, eraser and visible runner finish, with one upper archive folio/adjacent named tab. Tabs pan to archive reading composition; physical registration tab returns to clock. Preserve true overlap/curl, 44 px targets and all work/accessory links at 390/320 px. Simplify mug/pencils/ghosts rather than a flat feed or deleting the defining runner gag. Reduced motion freezes drawing/curls/trails with immediate real values. Graphics/import/asset failure restores the illustrated native archive/actions; optional textures leave warm paper, never black sheets.

### Implementation boundaries

The active opt-in module is `countdowns/concepts/still-drawing-tomorrow.scene.js`, with authored files under `countdowns/assets/concepts/still-drawing-tomorrow/scene/`. `scene-host.js`, `scene-surfaces.js` and `scene-gallery.js` share lifecycle, picking, native actions and dynamic surface values only. Legacy module/style files remain fallback/historical material. No site build or backend change is introduced.

Static vendored Three/local drawings/assets and semantic/preview adapters; no site build/framework/new timer. Preserve API/month semantics/isolation/limiter, reel model, faithful archived pages and Fair. Shared adapter supplies complete content/link/state; module owns table/folios/camera/surfaces. No upright permanent DOM image/clock pins or required three-mount hero. Source is an art target, not a full-page background shortcut.

### Fidelity checks

**Current art-director finding.** The current desktop recognizes the overhead graphite clock, runner loop, genuine registering folios, pencils and eraser. The red worn end and crumbs give Again more material identity than the prior white block. Broad ghost/stacked sheet strips remain visually distracting, stock still reads thick/clean, and the saved rest view does not establish the source’s large developed acetate curl. Golden C-shaped shavings are too repeated and lighting quieter than the source’s raking fibre shadows. The saved phone keeps a full clock, Again and primary Severance folio visible; small side/group tags and clipped stacked sheets remain a direct navigation/legibility gate. All thirteen actual folios have individual stops. Review the new stock deformation during focus and ticks, not merely a flat resting frame; no offscreen or transparent rectangle should substitute for a visible authored curl. At 390/320 prove clear D/H/M/S, reachable tabs and the real preview. Paper anatomy, graphite roughness and battered rubber remain the source gates. See the [version-specific current report](../reports/still-drawing-tomorrow.md) and [browser evidence](../architecture/evidence/rebuilt/README.md). The offline controller/model checks establish inventory and state behavior; no GPU appearance, measured FPS or art acceptance is claimed.

Gate 1 before navigation/secondary effects: one faithful archive cel with broad rolled corner, one large live graphite numeral/construction region and worn eraser under final daylight. Compare source crops and curling capture: image/ink deform together, reflected window crosses curl, underside/contact reads acetate. Reject white corner triangle, noise-covered stock glyph, clean button rubber or elementary line runner.

Gate 2: match complete original overlap/density/material before archive expansion. Then desktop/390/320 comparisons; all 13 works, five More links, Dexter timeline/Severance live link; separate lift/open; true preview/new-tab/focus; visible erase/redraw/runner hold; actual pending/error/429/remote/expiration; reduced motion/graphics loss. Functional passes cannot approve visual failure. No current visual acceptance is claimed.
