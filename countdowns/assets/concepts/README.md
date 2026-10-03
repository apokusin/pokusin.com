# Authored countdown assets

The seven rebuilt candidates use real editable scene geometry, separate surface
maps, named live reading faces and their own physical layout. They are served as
static GLBs; Blender is an offline authoring tool, not a website dependency or
build step. Clock, reset count and archive screenshots are supplied by the real
shared state/archive at runtime. A successful export or a small file does not
establish art acceptance, touch reach or device frame rate.

| Candidate | Authored source and reproduction notes | Phone source |
| --- | --- | --- |
| Tomorrow’s Roadworks | [Continuous miniature coast and folded road](tomorrows-roadworks/scene/README.md) | Independent runtime composition using the same complete model |
| Bubblegum Time | [Connected membrane, drum apertures and curling stock](bubblegum-time/scene/README.md) | Independent runtime composition using the same complete model |
| After the Flame | [Poured landscape, real recesses and pressure pool](after-the-flame/scene/README.md) | Separate editable scene-mobile.blend and scene-mobile.glb |
| Low Tide, Later | [Eroded chalk, ribbed shell and depth-aware shore](low-tide-later/scene/README.md) | Independent runtime composition using the same complete model |
| Not Yet Ripe | [Gnarled branch and unequal cut specimens](not-yet-ripe/scene/README.md) | Separate export from the same authoring script’s --mobile rig |
| Still Drawing Tomorrow | [Physical stock, acetate, eraser and generated ink masters](still-drawing-tomorrow/scene/README.md) | Independently staged physical folios and clock cel in runtime |
| Held in Suspense | [Cantilever, polished counterweight and reflection room](held-in-suspense/scene/README.md) | Separate editable held-in-suspense-mobile.blend and scene-mobile.glb |

## Measured export snapshot

The [machine-readable report](../../../docs/countdown-concepts/architecture/asset-budgets.json)
records exact byte counts, SHA-256, primitive attributes, image dimensions and
editable/script paths for each current export. Regenerate it after an export:

```sh
python3 docs/countdown-concepts/architecture/measure_assets.py
```

The measurements sum each exported primitive once. Runtime clones, live ink,
archive stills, glyph atlases, mipmaps, geometry buffers and reflection/water
targets can add memory or drawn triangles. The decoded figure is only the GLB’s
embedded images as base-level RGBA8; it is not total GPU memory. Some untextured
primitives omit UV/tangent attributes; the report states the actual counts.

<!-- asset-budgets:start -->

Measured 2026-10-03 UTC; exact hashes are in the report.

| Candidate | Export | File MB | Exported triangles | Embedded RGBA8 MiB |
| --- | --- | ---: | ---: | ---: |
| Roadworks | Shared | 19.61 | 394,377 | 10.00 |
| Bubblegum | Shared | 8.56 | 193,032 | 4.00 |
| Wax | Portrait | 10.86 | 180,458 | 4.00 |
| Wax | Desktop | 11.00 | 188,898 | 4.00 |
| Low Tide | Shared | 15.31 | 310,334 | 11.00 |
| Fruit | Portrait | 7.64 | 88,200 | 12.00 |
| Fruit | Desktop | 9.50 | 172,063 | 12.00 |
| Drawing | Shared | 11.47 | 318,214 | 8.00 |
| Metal | Portrait | 7.64 | 132,139 | 7.00 |
| Metal | Desktop | 6.65 | 108,689 | 7.00 |

<!-- asset-budgets:end -->

## Sources and rights

Geometry and procedural material sources are authored in this project. This
index records authorship without introducing a new licensing grant; no top-level
project license file is included. Original archive artwork/stills retain their
existing source rights and are mounted faithfully, not regenerated for the GLBs.

Bundled Bodoni Moda, Roboto Condensed and Caveat files retain their adjacent SIL
Open Font License notices. Their official Google Fonts source URLs and font-file
hashes are recorded in the relevant typography manifests. Drawing’s Caveat font
and [notice](still-drawing-tomorrow/Caveat-OFL.txt) live one directory above its
scene. The common vendored Three.js 0.180.0 keeps its
[MIT notice](../vendor/THREE-LICENSE.txt). Blender’s executable is not distributed
with the site. Asset scripts record Blender 4.5.14 LTS as the authoring version.

Original concept reference images remain visual targets in
docs/countdown-concepts/references. They do not become full-screen scene planes,
reflection maps or live UI textures. Inspection renders deliberately omit the
real clock/screens and are separate from actual browser acceptance.

## Generated raster provenance

Wax and botanical provenance.json files preserve the exact earlier ImageGen
prompt, returned source filename, converted WebP filename and SHA-256 of that
WebP. Those original filenames identify generation results; they are not hashes
of retained originals. The legacy canyon/branch art and Roadworks mineral-coast
image remain documented reference assets; the rebuilt scenes use authored
volumes instead of those scenery cutouts/backdrops.

Drawing’s [raster provenance](still-drawing-tomorrow/scene/artwork/provenance.json)
records the retained paper-stock, ten isolated digit glyphs and twelve runner
poses, plus the derived guttered runner atlas. Exact tool prompts are retained
where available; reconstructed descriptions are explicitly identified as briefs,
not verbatim prompts. They contain surface stock or independent ink shapes,
never a rendered current deadline, tally, archived page or complete website.
The older graphite SVG and the Fair’s static ground plan are locally authored
vector textures/fallback art. The accepted Fair remains on its own asset path.

`crown.png` is a transparent generated brass crown, resized to 128 px for the fallback semantic discovery button. Brief: a tiny brass crown with uneven points, a softly brushed warm surface, and a simple silhouette, isolated on a transparent background without lettering. Successful 3D scenes render their own single physical crown and conceal this fallback image.
