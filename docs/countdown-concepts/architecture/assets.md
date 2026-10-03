# Authored scene assets

**Implemented authored bundles; visual gates remain open.** Seven scene directories now contain editable Blender sources, Python exporters, GLB volumes, surface maps, manifests and geometry/light proofs. See the [current reports](../README.md) and [actual browser evidence](evidence/rebuilt/README.md) for version-specific results. A generated concept image remains a visual reference, not an editable 3D asset or runtime backdrop. Existing legacy helpers/rasters retain their historical/fallback role; they do not certify the replacements.

## Deliverable per concept

Commit an editable authoring source and a static runtime bundle under `countdowns/assets/concepts/<id>/scene/`. The selected offline workflow is **Blender 4.5.14 LTS**, with a project-owned Python authoring/export script and editable .blend source for sculpted refinements. Pin its version in the asset manifest. That maintained release and its official downloads are recorded on the [official release page](https://www.blender.org/releases/4-5/); Blender supports glTF/GLB export in its [official format pipeline](https://www.blender.org/features/pipeline/). Serving the resulting assets still requires no site build. The pinned Blender 4.5.14 LTS runtime has been used for these exports; its tool version is recorded in the bundles. Generated live values, archive screenshots and directional light are not baked into their authored scenery.

Use Blender to author/bake, then judge the exported bundle in the actual Three.js renderer. A beautiful Cycles still does not certify browser lighting, transparency or geometry. Do not rely on a hired modeler or an unspecified tool to finish the plan. The assigned asset agent creates/refines the source using the pinned workflow and provides reproducible exports; inability to author a required volume is an explicit failed gate rather than permission to ship a photo plane.

## Production ownership and first gate

Root assigns one asset author and one scene implementer for the selected concept, plus an independent art reviewer. They may be separate subagents, but file ownership remains exclusive. The asset author owns sculpt/profile construction, UVs, bake channels, glyph/art masters, pivots, morphs and export; the implementer owns the Three renderer/light rig and binds named surfaces to real state/actions. The reviewer compares actual source/exported renders and can reject either. No agent marks its own blockout polished.

The first Metal slice supplied the slate anchor, complete folded lower arm, one upper suspended plate, one tall live numeral plate, true oblique weight/endcap and the architectural reflection room. Required named surfaces/pivots and projected face proportions are specified before export. Check installation/type proportions in [composition anchors](composition.md). The opening frame's other objects can be gray inspection placeholders during asset construction, but a final resting-frame pass requires the complete reference arrangement.

Tool setup/version validation was completed. Preserve the editable source, script, export, node/map manifest, a clay three-quarter inspection and an actual Three.js final-light crop. The scene implementer cannot expand thirteen unfinished copies while that artifact set is missing. The first time a bundle loads, compare its exported mesh/materials against the authoring render to catch unsupported nodes, missing tangents, colour-space shifts and dropped morphs.

| Deliverable | Required contents | Gate |
| --- | --- | --- |
| `scene.glb` or documented geometry bundle | Actual volumes, back/edge surfaces, named pivots, valid UVs and normals; deformation targets where required | Inspect clay silhouette, three-quarter view, contact and underside |
| `materials/` | Separate colour, normal, roughness and useful AO maps; metalness/thickness only where material needs them | Flat light must show surface detail without baked-in directional highlights |
| `lighting/` | Documented key/fill/shadow setup, authored reflection environment and any fixed scenery lightmap | Rest frame must reproduce reference light hierarchy, including dark reflection shapes |
| `layout.js` | Desktop and phone camera poses, exhibit anchors, navigable paths and explicit scene boundaries | All destinations reachable at 320/390 without shrinking a desktop screenshot |
| `manifest.json` | Relative URLs, required/optional status, object/pivot names, source/license, file and decoded texture budgets | No missing object, failed required asset or silently discarded load |
| `fallback.webp` | A render of the authored scene with blank numerical/action/preview faces | Native real values and anchors fit; no fake reference numbers or baked controls |
| `authoring/` | Editable source, export/bake instructions and exact tool/version if one is used | Another agent can reproduce the deliverable without guessing its proportions |

The table remains the required deliverable contract. Current bundles document camera/layout/light data in their runtime modules and manifests rather than universally providing separate `layout.js` or `lighting/` files; illustrated failure views currently reuse the native archive. These differences must stay explicit. Ordinary GLB and PNG maps are implemented. Official GLTFLoader and dependencies are now vendored from the same **0.180.0** release as the core with licensing; compression decoders have not been added. The loader supports named scene content/animations, but imported image bitmaps need explicit cleanup. [Official loader documentation](https://threejs.org/docs/pages/GLTFLoader.html).

## What must exist in three dimensions

| Concept | Required silhouette and construction | Maps/lighting that cannot be substituted with one noise texture |
| --- | --- | --- |
| Roadworks | Unequal quarried rock masses, pink concrete piers, one supported elevated road, thick timer sign, true rollover spool, distinctive modeled crane/vehicles | Concrete aggregate and dust, blue worn asphalt, painted metal, warm low sun/cool distance, local sign lamps |
| Gum | One variable-thickness membrane with four real apertures, asymmetrical bridges, gathered pin roots, neck joining a large bubble, curled prints | Rose absorption/thickness, glossy coat, broad studio reflections/dark gaps, cream enamel drums and fibre paper |
| Wax | Continuous irregular canyon volume, cut recesses, long melt channels and undercut drips, tapered candle, bent wick, recessed timer banks | Wax thickness and subsurface approximation, warm flame contact, cool terrace edges, localized soot/pore detail |
| Tide | Eroded irregular chalk posts with side/back depth, scallop ribs, uneven photo edges/curls, authored seabed elevation | Wet/dry chalk and paper masks, sand grains/chalk crumbs, transparent blue water with actual bed depth, connected contact foam and light caustics |
| Fruit | Gnarled connected branch, knots/twists and bifurcations; longitudinal fruit cuts with ragged pith, segment membranes, seeds; irregular leaves/petiole hinges | Citrus rind pores versus translucent vesicles, bark fissures, leaf veins/transmission, papery tags, warm directional sun and botanical shadows |
| Drawing | Uneven overlapping paper, separate curled acetate layers, punched holes, peg registration, beveled worn eraser, pencils/shavings | Graphite/drawn numeral atlas, paper fibres/stains, clear acetate reflection and receiving contact shadows, rubber/paint abrasion, window light |
| Metal | Thick beveled asymmetric beams, real mechanical joints, thimbles/cables, cambered suspended plates, tilted cylinder and collars, fractured slate anchor | Directional brushing and tangent basis, separate polished/dark inserts, slate cleavage, shaped architectural reflection source and floor contacts |

Primitive geometry is appropriate for a small screw, machine axle or seed starter shape. It cannot replace the defining sculpted form. Unequal detailed fruit cannot be four identical discs. Wax banks cannot be a photograph with torus rims in front. Paper curls cannot be extra transparent cutouts behind an upright HTML photograph. The Fair's deliberately low-poly construction is its own style, not a quality shortcut for these seven references.

## Authoring steps

1. Measure the source image's dominant masses and negative space in normalized coordinates. Record anchor, timer, reset, first exhibits, crop boundaries, horizon/vanishing directions, overlap and shadow direction. Trace for measurement only; do not use a traced image as the live page.
2. Build a clay scene with real world thickness, contacts and attachment graph. Use a neutral material and inspect from the reference camera plus a side view. A plausible front projection with a broken side/back surface fails this step.
3. Add UVs/normals, pivots and constrained morph targets. UVs on deforming meshes travel with the material. Use separate rigid readable regions for glyphs/screens. A control's hit surface and supporting visual object must follow the same transform.
4. Produce surface maps from material authoring and mesh baking. Generated raster textures may contribute albedo or artwork, but their highlights cannot become a guessed normal/roughness map. AO must describe actual cavities/contact, not simply darken every pixel. Moving assembly contacts need runtime shadows/contact treatment; do not bake a hanging plate's moving shadow into a fixed wall.
5. Light the completed asset. Tune source whites, dark voids, reflections, exposure and contact before post effects. An environment map supplies material reflection; it does not automatically reproduce a local scene reflection or global illumination. An authored reflection room is appropriate for Metal/Gum. PMREM prefilters reflection by roughness and can be built from a supplied scene. [Official PMREM documentation](https://threejs.org/docs/pages/PMREMGenerator.html).
6. Mount faithful archive stills on authored screen/print UVs and assign dynamic timer/tally faces. Keep original content colours. Paper stock, frames and room lighting may surround the original; the archived website itself is never recoloured to match the world.
7. Render the final reference view and both phone compositions. Only after a strict rest-frame comparison passes should agents implement the additional cursor/reset gags and all archive stations. A finished texture list is not a visual pass.

## Material and rendering choices

Use `MeshStandardMaterial` for most opaque scenery; use the existing physical material selectively for clearcoat, transmission/thickness or brushing. Every enabled physical feature costs shading work, so large transparent layers require measurement. Transmission must preserve a surface reflection, not mimic tinted alpha alone; it is also not a wax subsurface solver. A thickness-aware custom wax shading approximation must be tested under warm and cool lighting and documented honestly. [Official material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html).

Colour art/maps are sRGB. Normal, roughness, occlusion, metalness and thickness are data, handled without sRGB conversion. Brushing needs a valid tangent direction. World units and thickness maps must have an explicit relationship; copying a numeric thickness into a differently scaled model is not an art recipe.

Allow one useful concept-specific effects chain where required: Tide's depth/refraction/foam is structural; restrained localized flame bloom can be structural for Wax. Post effects cannot turn an incorrect silhouette into the source. Keep paper and botanical views sharp. Protect ink/screenshot legibility from specular bloom, refractive displacement and motion blur.

Before imposing a numeric geometry ceiling, render/profile the real asset. Start with bounded DPR and one tightly framed shadow caster, bake fixed scenery detail, instance genuinely repeated props, and lower invisible detail before removing source-defining forms. Keep phone transfer and decoded-texture memory budgets in the manifest; these are measured separately. Do not promise device FPS based on polygon count.

## Asset readiness and failure

The selected bundle loads only its own assets. Await every required model, decoded texture, relevant font and reflection resource before hiding native content or starting interaction. Never return an unloaded black material map and call the scene ready. Show a clean fallback/native clock throughout loading; transition atomically to the completed scene. Abort/ignore late completions after teardown and explicitly dispose their resources.

If a required asset or graphics context fails, reveal all native actions and thirteen real works, cancel capture/drag/preview pose changes, remove visual clipping, clear lingering immersive classes and restore focus to a visible semantic equivalent. A missing optional crumb can be omitted; a missing canyon, connected membrane or chrome assembly cannot be replaced by a default box and silently marked successful.
