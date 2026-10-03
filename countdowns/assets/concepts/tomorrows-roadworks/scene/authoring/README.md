Tomorrow’s Roadworks is authored as a complete three dimensional coastal model.
The original concept image supplies measured composition only; no photograph is
used as foreground geometry, UI, or a hidden scene backdrop.

Reproduce with Blender **4.5.14 LTS**. Run `build_scene.py` using Blender's
`--background --python` options. The script writes `scene.blend`, `scene.glb`,
surface maps, camera/node manifest and blank-face Cycles/clay proofs. On this Mac
the temporary, verified authoring executable is
`/private/tmp/countdown-blender-4.5.14/Blender.app/Contents/MacOS/Blender`.
The portable official release requires normal GPU-driver access for headless
startup; no global application or website build step is introduced.

The reviewed source also contains later convex-cap/pivot and normal corrections.
Use `refine_art_surfaces.py` on that current editable source for the surface pass;
do not regenerate its composition wholesale. The utility keeps the opening
camera and all 59 named semantic objects' transforms, geometry, UVs and feed
morph data exact. It authors intersecting fracture planes/eroded limestone
pockets inside the previous rock bounds, dense unequal folded-leaf plants,
low ground erosion and matched colour/linear mineral maps. It verifies the
packed PNGs actually match the authored map files. All authoring saves use
Blender compression, keeping the editable source under Cloudflare Pages' 25 MB
individual-file limit. Its optional `--proofs` output is blank-face material
evidence, not a replacement for the actual browser source/phone review.

`inspect_export.py` validates UVs, normals, tangents, all 13 preserved-work
surfaces, seven real accessory destinations and both finite feed targets, then
records measured transfer/decoded-map/triangle budgets and SHA256. Standard
Python suffices for inspection. Pillow is needed only to export the optional
blank-face WebP fallback from `proofs/opening-authored.png`.

Blender uses `(x,y,z)` with Z up. glTF/Three uses `(x,z,-y)` with Y up. Reading
faces point toward the camera along glTF +Z, with their actual authored yaw;
UV0 bottom-left is (0,0), top-right (1,1). The exported `opening_camera` and
manifest define the desktop source view. The concept module independently
composes phone clock/action and road/station views rather than fitting island
bounds into portrait dimensions.

The road is a closed, thick sweep through 24 measured control positions.
Guardrails, aged lane paint, embedded aggregate and grounded supports follow
that sweep. The roll is a real winding shell with open layered ends, an axle,
hook/yoke, connected feed seam and finite two-target deformation. No geometry
grows with presses. Static repeated scenery is joined by material; a moving
vehicle is joined within its own named group. Semantic plates, version mounts,
button, roll and lifting corner retain independent named pivots.

`optimize_scene.py` removes loose rocks obscuring the cast title and reduces
secondary cast surfaces after preserving their silhouettes. `pack_attributes.py`
uses the ratified KHR_mesh_quantization extension supported by the vendored
Three loader: normals use normalized signed bytes, tangents use normalized
signed shorts, and UVs use normalized unsigned shorts. Positions, camera
transforms and both morph displacements retain their original floats. This
requires no additional decoder. Exact current runtime bytes, triangle count,
decoded embedded-image dimensions and SHA-256 are recorded in the shared
`docs/countdown-concepts/architecture/asset-budgets.json` snapshot. Regenerate
that ordinary-Python report after an export; runtime ink/stills, mipmaps and
renderer targets are separate from its base-level embedded RGBA8 figure.

`clock_d/h/m/s`, `clock_*_unit`, `clock_heading`, `again_ink` and `press_tally`
are blank live-state faces. `work_*` holds faithful archive stills supplied by
the shared host; `caption_*` holds existing show/version names. `station_*_mount`
owns its backing and reading surface. `station_number_*` selects the physical
road stop. `link_archive_*`, `link_timeline_dexter`, and `link_live_severance`
have genuine URLs supplied by the host. The rolled corner is the sole crown
gesture and never resets the countdown.

Albedo is colour data; normal/roughness/AO are linear data. Normals derive from
authored height relief. Casting AO is baked from fixed cassette/rim contact
with the movable cap excluded. Coarse stone relief, chipped edges and plant
mass are actual geometry before microtexture. Embedded geometry normals,
UVs and tangents are exported; editing a shader cannot replace these forms.

The material/light/camera runtime is `countdowns/concepts/tomorrows-roadworks.scene.js`.
One warm lateral shadow key, restrained cool sky bounce, local work pools and
a coherent enamel reflection source share one exposure. Browser source-frame,
390/320 phone, input/preview/cancellation, graphics loss and reduced motion
reviews remain separate acceptance gates. Cycles proofs and export validation
never certify a final visual pass.
