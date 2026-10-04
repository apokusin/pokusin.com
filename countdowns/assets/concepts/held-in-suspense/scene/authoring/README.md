# Held in Suspense — authored installation

This bundle replaces the old front-facing diagram with an actual articulated mechanical installation. It is an asset production handoff. Independent source comparison and Three.js lighting/mobile approval remain required.

Reproduce with Blender **4.5.14 LTS**, build `62c1db4208e8`:

```sh
/path/to/Blender --background --python create_scene.py
python3 inspect_export.py
```

The authoring script writes the editable `held-in-suspense.blend`, glTF `../scene.glb`, separate material maps, node manifest, and real render inspections. A second run with `-- --phone` writes `held-in-suspense-mobile.blend`, `../scene-mobile.glb`, `manifest-mobile.json` and portrait proofs from a separately composed physical rig. The standard-library export inspector measures the desktop buffers and optionally converts its blank render to a compact fallback. The shared `docs/countdown-concepts/architecture/measure_assets.py` measures both GLBs without modifying their models/manifests. The Blender executable is an offline authoring dependency; neither Blender nor a site build is required to serve the scene.

The temporary macOS authoring binary came from Blender's [official mirror service](https://mirror.blender.org/release/Blender4.5/blender-4.5.14-macos-arm64.dmg). Its SHA256 matched Blender's [official checksum](https://mirror.blender.org/release/Blender4.5/blender-4.5.14.sha256): `65134d9b07b20e2fa8d3c9e44f6f44ffb5c9774dd521b95f50387310241ca170`. No system application was installed or changed.

Geometry and surface patterns are project-authored. The original generated reference is used only to measure the sculpture and compose the authoring camera. It is not a scenery plane, reflection map, or live interface texture. All live numerical, tally, action and archive-screen faces are intentionally blank in these renders.

The glTF conversion is Blender `(x,y,z)` → glTF `(x,z,-y)`. The actual numeral faces have UV0, bottom-left `(0,0)`, and outward front +Z after export. Their slight camber follows the volume. Clock faces, archive reading faces, pivots, counterweight cap, reflection-room geometry and authoring camera are individually named in `../manifest.json`. `reset_ink` is a dedicated circular reading mesh on the true cap, with its printed vertical tangent derived from world up; `reset_face` remains the metallic volume. `reset_tally` uses that same cap tangent basis.

The slate anchor has unequal fractured strata and chipped shear faces. Beams are continuous closed mitered sections with real thickness and rounded machining edges. Eyelets and collars have actual through-holes. Cables are three woven strands rather than black straight image strokes. The counterweight's readable cap is perpendicular to its actual body axis; these two surfaces cannot be separated for convenient front-facing lettering.

The wall/floor/window scene supplies physical light and dark reflection shapes. Window bays continue behind the camera, where front-facing metal reflects, and include actual mullions/columns rather than a uniform white environment. Runtime should create its static prefiltered environment from these authored shapes and align the shadow-casting key to the same left window. Luminous panes should not cast shadows; their physical mullions should. The Cycles proof is geometry/material evidence, not a claim that browser lighting already matches it. Clock/preview ink should remain legible after light tuning.

Material color PNGs are sRGB; roughness and normal PNGs are data. Directional brushing is a small normal/roughness pattern. Cleavage, joints, beam folds and frame depth come from geometry. No directional lighting is painted into the surface maps. Runtime contact shadows remain necessary for moving plates and weight.

Opening hierarchy: unequal Dexter left, larger Severance center, Game of Thrones upper-right; four tall live plates below; slate lower-left; oblique reset weight lower-right. The phone rig has a narrower folded cantilever, unscaled clock proportions, a right/lower reset cylinder and rear load channel on actual shafts. Runtime extends the authored beveled mount classes into the full thirteen-work inventory on connected fan supports. The base GLB has the three opening photographic mounts; additional runtime mounts are not falsely counted as separately authored GLB nodes. Geometric/pose inspection and source/browser acceptance remain distinct.
