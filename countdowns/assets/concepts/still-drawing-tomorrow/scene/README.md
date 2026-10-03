# Still Drawing Tomorrow

A physical animation table: actual stock thickness, bent acetate/cel surfaces,
unequal pinned folios, a graphite clock strip, worn rubber and paper eraser
sleeve, pencils, shavings and coffee. Thirteen faithful pages are printed on the
real flat areas of their own folios. Existing preview/URL semantics and the
shared deadline/reset count remain owned by the host.

## Reproduce

Use Blender **4.5.14 LTS** from the repository root:

```sh
Blender --background --python countdowns/assets/concepts/still-drawing-tomorrow/scene/authoring/create_scene.py
python3 docs/countdown-concepts/architecture/measure_assets.py
```

The script writes editable authoring/still-drawing-tomorrow.blend, scene.glb,
procedural material maps, manifest and a real blank-face lit proof. It does not
regenerate ImageGen ink masters. Retain those masters and their provenance when
reproducing the bundle. X/Y describe the table drawing plane, +Z faces the
camera; export_yup=False preserves these deliberate coordinates in Three.

## Ink and art sources

artwork/graphite-digits.png contains the ten isolated graphite glyphs, not a
countdown. Runtime crops each actual glyph without stretching it, then uses the
shared reel model to paint current values on clock_d/h/m/s. Registration marks
and sparse D/H/M/S captions are independent ink on the same physical cel.

artwork/runner-cycle.png is the original twelve-pose runner master.
runner-cycle-spaced.png is a derived 4×3 atlas with isolated, guttered cells for
the runtime’s 12fps ink cycle. The drawing path/finish and reset eraser response
are runtime ink/object states, captured along with folios/cels for preview
return. [artwork/provenance.json](artwork/provenance.json) records exact retained
file hashes, dimensions, source relationships and the limits of retained prompts.

../paper-stock.png is a retained generated surface study with its exact prompt
in ../paper-stock.provenance.md. The rebuilt model currently uses independently
authored material maps, including paper fibers/roughness, rubber pores/contact
wear and sleeve graphite. The generated study is not a full website backdrop.

Geometry/material patterns and locally authored graphite SVG are project work;
this document introduces no new license declaration. The self-hosted Caveat
font retains ../Caveat-OFL.txt and its official Google Fonts source. Shared
Barlow Condensed/runtime notices are documented by the site’s common assets.

Phone stages whole physical folios, the clock cel and eraser independently;
the type remains proportional. Actual art/readability/interaction gates are
separate from exported primitive, decoded texture and file-size measurements.
