# Bubblegum sculpture bundle

This is an authored candidate for the source-fidelity gate. It replaces the separate slab/bubble approximation with one Boolean-unioned membrane, gathered neck and inflated bladder, four genuine open apertures, eight cream cylinders, thirteen curled cotton mounts and turned pins. The offline proof is geometry/material evidence; final acceptance requires the actual browser renderer beside the original reference.

Runtime reads `scene.glb` and the real archive/clock. No live values, fake deadline or archived screenshot is baked into this art. `manifest.json` records nodes, dimensions, reading faces and material sources. Typography has its own licensed-source manifest and source-versus-candidate sheet.

## Reproduce

Use Blender **4.5.14 LTS**, official macOS build `62c1db4208e8`. From the repo root:

```
/path/to/Blender --background --python countdowns/assets/concepts/bubblegum-time/scene/authoring/build_scene.py -- --proofs
```

The bundled Pillow runtime can reproduce the glyph/title masters:

```
python countdowns/assets/concepts/bubblegum-time/scene/authoring/build_typography.py
```

The editable `authoring/scene.blend` retains the studio and camera. The export excludes those inspection lights/background and serves ordinary static glTF. The site owns its actual Three.js lighting and reflection room. Geometry/procedural maps are project-authored, without a new license declaration here; Bodoni Moda and Roboto Condensed retain their included SIL Open Font Licenses.

## Coordinate and animation handoff

The authored artwork uses X right, Y up, Z toward its opening camera. The exporter intentionally disables Blender's additional Y-up conversion to preserve those coordinates in Three.js. Front UVs follow glTF's top-origin convention; runtime image/canvas textures use `flipY=false`.

`gum_connected_membrane` includes the joined elastic volume and morphs `Breath` and `Pull`. `Breath=1` is a maximum 12% pressure deformation localized to the bladder/neck; fixed pin/drum neighborhoods are guarded. `Pull` may be bounded to -1..1. The bubble and neck named locators document regions; they are not separate sphere/cord meshes. If the importer creates several primitive meshes, apply the corresponding morph to each child with a morph dictionary.

Each `screen_timer_*_left/right` is a cylinder reading arc, radius 1.006, two-column assembly width 1.51. The site's real reel model paints its single digit on that actual curved UV surface. `screen_<show_version>` is a flat preserved screenshot center, surrounded/physically occluded by the thick curling paper; it opens the real archived page. Screenshot URLs remain the generated archive data, not this manifest.

The first source composition contains Severance tracker, Dexter S8 final, Game of Thrones S4 and Archer S5 final. Nine additional stations continue the same tether installation beyond the opening crop. Native vertical scrolling travels between those thirteen physical prints; keyboard focus approaches the corresponding print. Five archive destinations, the Dexter timeline and the live Severance site are attached to tiny cotton arrow tabs. Their tucked destination labels unfold on hover or focus. The complete native archive stays available during loading and graphics failure.

The runtime uses neutral studio illumination, a cool gray mint sweep, neutral ivory cotton and cream drums. Actual white reflection panels include a broad mullioned window and dark edge fill. The physical gum material adds subtle thin-film iridescence, without painted highlights. Unit ink sits ahead of the lip clearance; the small press tally occupies the joined Again droplet. The opening title uses the licensed static master on a scene plane.

## Inspection proofs

- `proofs/opening-authored.png`: blank reading faces, color and source composition.
- `proofs/geometry-three-quarter.png`: actual cylinder/cavity depth and folded stock.
- `proofs/clay-three-quarter.png`: unlit-image-independent macro relief, thickness and joins.
- `typography/type-candidate-sheet.jpg`: original type crops beside all ten actual candidate drum glyphs and the title master.

The static proof has blank ink/photograph surfaces intentionally and predates the final neutral studio tuning. The browser mounts faithful stills and authoritative digits. No proof is a claim that the complete interactive page has passed desktop/mobile review.

Current measured GLB bytes, primitive attributes, decoded embedded images and
SHA-256 are in the shared asset-budgets.json report. Regenerate it with
`python3 docs/countdown-concepts/architecture/measure_assets.py` after an export.
Its measurements exclude runtime ink/archive stills, renderer targets and
mipmaps; they are not a device performance result. Portrait is an independent
runtime staging of this same physical membrane/drum/paper hierarchy.
