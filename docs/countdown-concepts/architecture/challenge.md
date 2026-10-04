# Skeptical art-direction review of the architecture reset

**Review scope:** the original seven reference images at native size, the proposed runtime/asset architecture, the sculpture and installation analyses, and the seven replacement specs. This is a review of a plan, not a review or approval of rebuilt scenes. No new asset, render or interaction is evidenced here. The Fair is excluded and must remain unchanged.

**Verdict:** the new direction addresses the actual structural failure. A complete material installation can now determine its composition, rather than decorating an HTML clock and gallery. It is a credible architectural direction, **conditional on the production and interaction decisions below**. The rejected published scenes remain rejected. More prose about material properties would not satisfy these conditions.

## Must-fix findings from the initial review

These findings describe the first architecture draft. The resolution review below records subsequent changes and separates resolved planning decisions from still-unpassed production gates.

### 1. Make the first asset workflow executable

The initial `assets.md` described the right deliverables, but had neither a selected authoring tool nor an authored asset. A `.glb` manifest and the instruction “high-resolution sculpt” cannot produce the wax canyon, gathered gum neck or longitudinal fruit anatomy by themselves. These are the main work, not a dependency to be filled in after the host is finished.

For the first Metal slice, name the authoring method and exact editable source: a reproducible beveled-profile mesh script is a plausible choice for rigid beams; a modeling source is another. Produce one folded arm, its real joint, one plate, one oblique counterweight and its reflection room together. Record how normals, UVs, pivots, material channels and export are generated. Do not create a generalized asset compiler. A side-view clay render must demonstrate that the fold has actual thickness and the cap belongs to the cylinder before any polished rest-frame claim.

For each subsequent concept, choose a method that can author its defining form. A Wax metaball generator is not executable art direction until its deliberate banks, undercuts and inset recesses are demonstrated. Drawing additionally needs an actual illustrated runner and graphite digit assets. If that illustration work is not available, state the missing asset rather than substituting a stick figure. Do not silently use a generated full-page picture as a bridge over missing assets.

### 2. Resolve gesture ownership in the full viewport

“Native scrolling follows a camera rail” needs an actual scroll surface and state mapping. Without that, a fixed canvas has nowhere to scroll, or a material drag accidentally becomes camera travel. Specify the following for every scene before input code: the navigation surface, the physical selection region, the deformation region, the first intent threshold, cancellation, and the visible return route.

| Scene | Navigation intent | Separate local action |
| --- | --- | --- |
| Roadworks | Travel along the road from empty ground or a number stone | Lift/pull the supported roll; never start route travel from its lip |
| Gum | Scroll along a real camera runway or drag free mint space | Pull visibly free gum, leaving paper centers and drums stable |
| Wax | Follow the poured channel or select a visible cavity | Press the concave Again pool; flame response is decorative |
| Tide | Follow the shore from free bed/water space | Activate a photograph or shell; do not make a ripple another navigation mode |
| Fruit | Follow the branch or select a tag | Open the visibly folded crown leaf; do not hide the only archive route behind foliage |
| Drawing | Pan free desk space or select an exposed show tab | Lift a curled cel lip; image activation opens the genuine page |
| Metal | Move along the rail from free room space or its physical index | Fan a version-stack lip, press the weight, or disturb the floor filings |

These are interaction distinctions, not a proposal for seven different input engines. Ordinary vertical touch scrolling is a good default if a real invisible runway is used. A deformation region then needs an explicit tap/lift or predominantly lateral gesture. Pointer movement alone must not relocate a target under the visitor's finger. Provide a visible Clock/home/index return at later camera stops; a route available only through hidden keyboard semantics is incomplete.

### 3. Lock the actual content-to-object inventory

The current gallery has **13 preview records**: Game of Thrones 3, Dexter 2, Sherlock 2, Archer 1, Breaking Bad 2, House of Cards 1, Severance 2. The Dexter episode timeline is a separate real link. Collapsed variants are available through the **five** existing archive pages for GoT, Dexter, Sherlock, Archer and Breaking Bad. Do not invent seven show archive pages or confuse a show-selection camera stop with an archive URL. Preserve the live Severance destination separately.

The scene manifest needs stable real record IDs, native URLs and labels, a physical owner/cluster, its resting and approached pose, and the visible means of reaching it. A sentence saying “all 13 works continue along the installation” is insufficient for implementation. Every object must have a route from the opening view and a way back. The source's opening hierarchy remains intact while later content extends it: Gum starts with four unequal prints; Metal/Wax/Drawing/Tide start with three; Roadworks presents seven stations. This does not authorize a universal three-print composition.

### 4. Protect typography and composition as authored assets

Few labels does not mean tiny generic type or no visual typography. Gum's enormous cropped black serif, Fruit's compressed vertical title, Drawing's graphite numerals and red/blue construction lines, and Metal's tall narrow numerals are substantial forms in the references. A named CSS font alone does not preserve their width, slant, rhythm or pressure.

The asset handoff must include a measured opening composition: dominant silhouettes and negative-space regions, clock/action faces, first-work hierarchy, intentional crops, and key shadow/reflection direction in normalized reference coordinates. Include authored glyph/title treatment where it defines the image. Scene text must belong to its physical surface; do not make it browser-facing to repair readability after choosing an incorrect camera. Readability must be designed into the camera and safe reading region together.

One concrete correction: Metal's proposed “approximately 2:3” plate faces are too squat. The reference's visible clock faces have widths roughly half their heights, with perspective varying the four projected quadrilaterals. Measure their actual corners and begin near 1:2, instead of preserving a guessed ratio that reproduces the rejected square-ish plate shape.

### 5. Demonstrate coherent light instead of accumulating features

The first Metal proof needs broad window reflections changing over rounded bevels, actual dark reflected room shapes, a heavy matte slate anchor, and the same window direction crossing wall/floor. It cannot pass with brushed noise, grey metallic boxes or a painted reflection stripe. The cap cannot face the browser independently of its tilted body.

The equivalent defining tests differ elsewhere: Gum's gloss must stretch continuously through the neck and apertures; Wax's cold porous banks and molten channels must remain different under one flame/rim setup; Tide's water must meet real post/bed depth; Fruit needs different dry peel, pith, juicy relief and thin leaves; Drawing needs broad curls, transparent overlap, ink following acetate, and tight contact shadows. Postprocessing and microscopic texture lists must not substitute for any of these relationships.

## Keep the architecture small

Sharing real values, semantic routing, asset readiness, lifecycle and the modal is sensible. Sharing composition, screen arrangement, camera grammar or choreography caused the failure and should remain forbidden. A two-module host/surface utility is enough to begin. Avoid a physics engine, scene editor, universal camera-state framework, mandatory GLB format for every small prop, or an effects stack imposed on all scenes.

The existing `exhibition.js` route must remain for the Fair. Do not refactor its helpers while extracting a new numerical painter merely to make the repository look uniform. The static fallback, shared D1 behavior and preserved archive pages already solve their own tasks.

## Evidence required at the next review

Bring actual source/reference comparisons at matching aspect and readable size: neutral clay with a side view, the complete opening rest frame, a short surface/camera motion sample, and the 390/320 composition. Separate asset fidelity, visual fidelity and functional results. Show one pending press, confirmed success, failed press and preview restoration only after the rest frame is convincing. A configured polygon/texture budget is not measured device performance.

The order proposed in the architecture is sound: Metal can expose surface attachment and reflection failures with rigid geometry; Gum can then expose real connected deformation. Neither should become a template for the others. Stop a slice that misses silhouette, material hierarchy or lighting. Do not amend the spec to call a weaker render a cleaner interpretation, and do not use passing reset/accessibility checks as an art verdict.

**This review supports the direction, not a rebuilt result.** Its five must-fix conditions belong in the common contract and production handoff before another implementation round. The actual quality decision remains pending real renders.

## Resolution review

The follow-up [physical inventory](INVENTORY.md) and [machine-readable map](inventory.json) resolve condition 3 at the architecture level. All seven concept maps contain every one of the 13 real preview records and all seven additional destination records. Their initial visible counts are 7/4/3/3/3/3/3 for Roadworks/Gum/Wax/Tide/Fruit/Drawing/Metal, matching the source hierarchies. The referenced thumbnail files exist. Five actual show archives are correctly distinguished from seven focus groups. Authored object poses, exposure and target reachability still need actual layout evidence at the implementation gate; this map does not claim those nodes exist.

The revised [asset handoff](assets.md) resolves condition 1 as a planning decision: Blender 4.5.14 LTS is pinned, editable Python/modeling sources and exported assets have exclusive production owners, and an independent reviewer judges the actual Three.js export rather than a beautiful offline still. The first Metal slice has a named required assembly and clay/final-light evidence gate. Tool setup and every new authored bundle are still unproduced. This is an honest production prerequisite, not a failed claim of finished geometry.

The [input contract](input.md) resolves condition 2 as a planning decision: a real native scroll runway drives concept-owned poses, vertical touch movement remains pan-y, explicit material regions own manipulation, and Clock/Home/Worlds remain visible from distant views. Its cancel/approach/focus-restoration behavior is specified. Roadworks now explicitly includes the roll/ribbon lip tap/lift and optional local horizontal pull alongside the dust trail, so the crown's initiating action is defined. The contract still needs real browser input evidence when implemented.

The [composition/type handoff](composition.md) resolves condition 4 as a planning decision. Its approximate normalized anchors align with the dominant forms in the original 1487 × 1058 images; they are correctly described as camera/modeling guides rather than a CSS layout or exact recovered lens. It corrects Metal's plate proportions, distinguishes the compressed Fruit title and high-contrast Gum title from automatic stock-font reuse, and requires a source/candidate sheet for all ten digits and other real inscriptions. No glyph atlas or final typography has yet passed that gate.

Condition 5 is now a concrete production gate in the composition and asset documents. Each source has its own light/contact/reflection/thickness proof, judged in the actual exported scene. These proofs have not been produced, so material fidelity remains wholly unapproved. A finished offline render cannot substitute for the browser scene.

The new [common contract](../../../countdowns/concepts/CONTRACT.md) shares behavior while leaving composition, camera, objects and choreography to the concept. It labels every new API as proposed and retains the Fair's legacy path. Required asset readiness, true surface graphics, visible semantic focus, solid occlusion, cancellation and exact preview restoration are specific enough for the first slice. The proposed read-only `getSnapshot()` now supplies the real deadline and server-adjusted current time for Fruit's optional material mask; it explicitly forbids reconstructing another deadline from digits. Preview restoration suppresses focus-driven reframing while retaining a visible focus cue. Both remaining adapter seams are resolved as architecture decisions. Keep the API minimal while implementing it.

| Initial condition | Architecture status after corrections | Still-unpassed production gate |
| --- | --- | --- |
| Executable asset workflow | Resolved: pinned tool, exclusive ownership, named first assembly and reproducible source/export handoff | Tool setup, actual meshes/UVs/maps/morphs and exported clay/light proof |
| Full-viewport gesture ownership | Resolved: native runway, pan-y, explicit material intent, visible return routes and restoration rules | Real mouse/touch/keyboard/cancellation behavior in a working scene |
| Complete physical inventory | Resolved: all 13 records, five archive pages, separate timeline/live links and concept-specific locations | Actual object poses, visibility, target sizes and reachable routes |
| Authored composition and typography | Resolved: source anchors, corrected plate shape and required type/art sheet | Final glyphs/drawings, full rest frame and 390/320 scene compositions |
| Coherent material/light proof | Resolved: different source-specific browser lighting/contact/reflection tests | Actual exported material response and original-versus-render comparison |

A final text audit of the root architecture, guide, common contract and replacement specs found no requirement to invent seven archive pages. References to seven show groups are correctly distinct from the five existing archive pages. Nothing in this resolution changes runtime behavior or claims new scene assets exist.

**Final architecture verdict:** proceed to the staged asset/Metal proof described by this handoff. The planning gaps have concrete resolutions; actual authoring, exported lighting, type, navigation and browser stability remain unpassed implementation gates. This is an executable architectural handoff, not acceptance of the current pages or evidence that seven worlds were rebuilt.
