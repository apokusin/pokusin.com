# Low Tide installation bundle

This is an authored candidate, awaiting comparison of its actual browser render with the original Low Tide reference. The sculpture is Y-up over an XZ seabed. Four independently profiled eroded chalk posts have closed side/back/rim geometry and shallow worn top concavities and eight curved live numeral patches. The scallop is a continuous closed ribbed fan with transverse growth layers, rather than an extrusion with decorative tubes. Thirteen curled paper prints continue along the same shore.

`scene.glb` contains no baked timer values, deadlines, action words or archived screenshots. The runtime mounts actual preserved captures and authoritative reel values on the named faces. The type atlas contains all ten glyph shapes only, each isolated in a 384×512 cell; its generator checks that no serif reaches a cell boundary. Runtime fits preserve the cell aspect ratio. The title is static licensed type artwork.

## Reproduce

Use Blender 4.5.14 LTS, official macOS build `62c1db4208e8`, from the repository root:

```
/path/to/Blender --background --python countdowns/assets/concepts/low-tide-later/scene/authoring/build_scene.py -- --proofs
```

Run `authoring/build_typography.py` with Pillow to regenerate the title, complete glyph atlas and original/candidate type sheet. Included Bodoni Moda, Roboto Condensed and Caveat files retain their SIL Open Font Licenses and official Google Fonts source URLs in `typography/manifest.json`.

The editable `.blend` includes its inspection lighting and camera. Export excludes that studio. The runtime provides actual daylight, shadowing, sky reflections, optical water and live material state. Geometry/procedural maps are project-authored, without a new license declaration here.

## Coordinates and surface inventory

- Y is vertical; X is right; +Z is the foreground. Blender's automatic axis conversion is deliberately disabled to retain these coordinates.
- `shore_bed_00` through `06` are seven independently culled sections of the same wandering contour, broad relief and shallow basins.
- `sea_surface_00` through `06` are actual XZ water meshes with a broad foreground crest. They are transparent to action picking. The authored bed and runtime foam/refraction use the same documented height field.
- `post_days`, `post_hours`, `post_minutes`, `post_seconds` support `screen_timer_<unit>_left/right` and `screen_unit_<unit>`. Their UVs follow the curved outer profiles. Dense separate ink patches follow the same profile with a small physical clearance; the digit and unit areas are kept outside the torn rim relief.
- `again_scallop` supports `screen_reset`. Pending moves the shell down locally; only confirmed shared state produces a returning front. `screen_tally` is a separate dry shore inscription.
- `paper_<show_version>` supports `screen_<show_version>`. Genuine image centers stay flat and protected from opaque water intersections; fiber, stock thickness, irregular edges and curled corners are physical surrounding art. Real labels and destination arrows are runtime ink.
- `brown_branching_weed`, `salt_crumb_clusters` and `indigo_shore_thread` are modeled shore details. The weed's tiny local response inherits the same disturbance field as water/paper.
- `salt_crystal_crown` is the sole Easter egg.

Front UVs follow glTF's top-origin convention. Runtime canvas/archive textures use `flipY=false`; newly authored runtime ink planes explicitly use the same basis.

## Water and route

`low-tide-later.scene.js` owns the opening plus thirteen distinct actual-record exposures on one native scroll rail, with direct focus on every print and seven additional destinations. It retains the established preview adapter and real reset API. There is no separate timer or tide counter.

The water uses Three.js physical transmission/refraction with depth from the actual bed. Deep water becomes less transmissive, while caustics are dim and confined to the shallow transition. It has separate broad displacement, several moving wave scales and restrained fragment-scale advected nonperiodic normals. The exported capillary map is retained as editable source material, but its tiled runtime layer is disabled after the phone comparison showed interference patterns. Broken foam patches and curved noise contours are confined by that same depth and actual post contacts; straight Voronoi borders supply only a small secondary detail. The caustic treatment is an inexpensive daylight focus approximation applied to submerged bed material; it is not a fluid or ray tracing simulation. Bounded ripples share their positions and ages with nearby paper-corner and weed response. Glyphs, shell action and the proportional-width real reel tally remain dry. A separate thin saline film supplies real environment highlights above wet print edges; faithful source captures remain the underlying unmodified image.

Opening camera: `[0,24,17]` toward `[0,0,0]`, vertical FOV 27. Phone uses a shorter diagonal with staggered bodies, a reachable shell and one complete leading print. The twelve later records occupy separate intervals along the same modeled coast, including every variant; native focus synchronizes to its exact record stop. Camera, shell/crown position, water phase, ripples, paper curl/hover/caption and destination visibility are captured for preview return. Reduced motion removes tidal/ambient/corner travel and assigns pending/secret transforms directly, while preserving immediate real state and navigation.

## Inspection evidence

- `proofs/opening-authored.png` shows source composition, volume and blank runtime faces.
- `proofs/geometry-three-quarter.png` exposes actual post and shell depth, paper curl and terrain.
- `proofs/clay-three-quarter.png` removes water and surface art to inspect macro geometry.
- `typography/type-candidate-sheet.jpg` puts original lettering beside all ten source-licensed glyphs and title.

The offline material proof does not contain the browser's contact foam, dynamic depth/refraction, print exclusions or live surfaces. Browser/phone fidelity, input/failure review and device performance are separate pending gates. Triangle/byte figures in the manifest are asset measurements, not frame-rate claims.

The shared asset-budgets.json snapshot records actual GLB bytes/hash, exported
primitive attributes and decoded embedded image dimensions. Regenerate it with
`python3 docs/countdown-concepts/architecture/measure_assets.py` after an export.
Those base-level RGBA8 image figures exclude runtime water/reflection targets,
live ink, archive stills and mipmaps. The manifest and saved camera describe the
opening; actual browser/phone acceptance remains separate.
