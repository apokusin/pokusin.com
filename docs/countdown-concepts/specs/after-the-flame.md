# After the Flame

Revised material direction, October 2, 2026. This revision supersedes the original flat-plate acceptance. Read the [guide](../GUIDE.md), [report](../reports/after-the-flame.md) and actual reference together. All rendering settings below describe the current starting recipe; device frame-rate acceptance requires measurement.

![After the Flame reference](../references/after-the-flame.jpg)

### Premise

Someone postpones tomorrow and a spent candle rebuilds itself. The archive is embedded in the wax landscape. The satire should register through the reversal of a material process, with no explanatory paragraph.

### Art style and composition

Build a macro wax canyon, cropped at left, with a quiet burgundy negative space and three recessed exhibits rising at right. The foreground carries a row of carved clock apertures and a shallow oval finger pool. The reference's uneven masses, pores and translucent drips are essential; neither a smooth beige cylinder nor freestanding rounded cards is an acceptable replacement.

The composition is a hybrid physical relief: the authored **art-only**, transparent canyon texture supplies its detailed sculpture and silhouette on a gently displaced mesh; real frames, lips, molten channels, flame and action rim occupy depth in front of it. The plate contains no labels, numbers, screens, crown or flame. Its static fallback is the same sculpture, with real native content placed independently. Do not replace the relief with a complete screenshot of the page.

Desktop clock centers are approximately 40.5/53/65.5/78% across at 73.5% down. Game of Thrones occupies the high-right recess; Dexter the lower-right recess; Severance the middle terrace. Keep the existing real archive pages and every complete title visible. The ordinary archive continuation repeats irregular wax mounts with open dark intervals, rather than boxed shelf rows.

### Palette and typography

Wax `#E8C797`, lit thin edges `#F3D5A5`, void `#190D17`, wick `#26171B`, restrained cool rim `#718DBD`, flame orange `#FF982E`. Shadows lean burgundy or slate, never neutral grey. Georgia owns digits, names, Again and the one hidden phrase; Arial owns navigation/status. Limit visible copy to existing names, D/H/M/S, Again and the actual press count.

### Geometry and materials

- Canyon: 120 × 84-segment relief, full transparent silhouette. Keep displacement to broad terrace depth plus small 0.03–0.07-unit folds. The alpha contour owns the smooth canyon opening; never delete individual triangles to create a stair-step hole.
- Clock: four irregular superellipse frames, 1.58 × 1.64 units, 0.15-unit lip thickness, uneven corners and seven short hanging lip threads per frame. The flat interior is recessed 0.13 units and receives the true native reel surface. No square DOM backing in a healthy scene.
- Exhibits: three 3.15 × 2.06-unit organic frames. Archive centers remain flat and unobstructed; upper drips stop outside the live hit region. Labels occupy the wax below the image, except when a particular overlap requires an above-frame caption.
- Action: a 1.45-radius oval pool, compressed vertically to 61%, bounded by a 0.12-unit wax rim. Again and tally are projected onto this physical surface; remove the independent CSS button pill while graphics work.
- Material: 256² deterministic packed roughness/thickness-proxy and bump maps. Cooled wax starts at roughness 0.78, clearcoat 0.12; molten channels at roughness 0.20, clearcoat 1.0. Normal-scale grain is local to wax rather than screen noise. Thin-edge warmth is a bounded shader approximation using grazing normal and the packed blue-channel proxy, not a claim of volumetric scattering.
- Contact: real shallow frame depth and the one shadowed key anchor foreground surfaces. Preserve pores and larger sculptural detail from the authored canyon texture rather than trying to recover them with an all-over noise filter.

`countdowns/concepts/liquid-materials.js` owns the small material/environment library. The canyon image's provenance remains under `assets/concepts/after-the-flame/`. No content is baked into art maps.

### Camera and lighting

Use a frontal orthographic macro relief camera, vertical half-span 5.5, at `(0,0,18)`. Its frontal projection aligns native live content precisely with physical faces; the canyon texture supplies the authored oblique macro perspective. Do not add camera sway that would expose projection mismatch.

Start exposure at 0.98. Warm directional key: `#FFB661`, intensity 1.8, position `(-7,7,12)`. Cool rim: `#718DBD`, intensity 1.05, position `(8,4,1)`. Burgundy/blue hemisphere fill: intensity 0.24. Actual flame-local point: `#FF982E`, intensity 14, 13-unit range, 1.7 decay. Key shadow uses 2048 desktop / 1024 phone, radius 4, ±12 × ±9 tightly bounded volume, 0.025 normal bias. Avoid hard theatrical cutout shadows around every frame.

A 128 × 64 procedural HDR environment places a broad warm window and narrow cool reflection strip in wax highlights. PMREM is created once; environment intensity 0.45. Canyon diffuse/emissive detail preserves its reference sculpture under the physical lighting; emissive intensity begins at 0.32. Tune this against the actual reference before increasing bloom or exposure.

### Interaction contract

Native links, clock, reset, tally and status remain genuine DOM surfaces, projected onto the relief. Every photograph opens its preserved page through the common overlay; modifiers and middle-click keep ordinary new-tab behavior. Freeze material choreography during a preview and restore the same pose on close. No decorative gesture mutates countdown state.

Again pending presses the wax pool slightly into its surface without creating new time or a success animation. A confirmed server success alone causes wax to climb and the existing reel/tally response. A remote observation lifts the flame once, without replaying local reverse flow. Errors retain the real state and short native status.

Exactly one small tarnished crown lives in a foreground crease. Hover/focus gently angles it; click/Enter reveals **Long may I count.** beside the clue. It does not require a reset. Keyboard focus remains active if the pointer leaves.

### Motion choreography

The flame leans at most 0.12 units toward a nearby pointer, with a low 0.045-unit idle sway. Its actual light intensity varies by only 0.4 around 14; it never strobes. Flame lift during success peaks at 0.23 units.

Twelve reusable molten strands remain fully invisible at rest. For 1.5 seconds after confirmed success they climb approximately 0.75 units, stretch at most 30%, then disappear. Keep upward motion plainly legible beside the candle and away from clock/image centers. Existing numerical reels retain 420 ms ordinary ticks and the 1080 ms plus 45 ms stagger reset model. A remote flame lift lasts 0.4 seconds at 0.08-unit amplitude. No accumulating wax geometry or permanent puddle growth.

### Effects and render budget

The additive flame mask and tiny bounded halo are the only glow effects. Use the HDR reflection and actual wax roughness for sheen; no full-scene bloom, lens blur, chromatic aberration, confetti or generic particle curtain. One shadowed key, one shared material library, bounded relief/frame geometry and twelve flow meshes. Dispose the PMREM target on scene teardown; the shared runtime disposes visible textures/materials/geometry. Stop decorative work offscreen, hidden and inside previews.

### Responsive and fallback behavior

At 390 and 320 px, keep the cropped candle on the left, two physical clock pairs, the oval pool below them, a large first exhibit above and two lower exhibits along native scroll. Scale frame geometry and projection widths together; do not shrink only the mesh while retaining desktop-sized DOM surfaces. The current phone clock scale is 0.64 and exhibit scale 0.68. Keep every image and name fully on-screen and preserve 44 px targets.

Reduced motion removes flame lean/light drift, climbing strands and crown tilt while updating real values immediately. Graphics loss removes projection and restores the authored canyon fallback plus real native controls and archive. Status/expired note/hidden phrase must never sit over Again or its tally.

### Implementation boundaries

Static site and vendored Three.js only. Shared API, numerical model, faithful archive destinations and common preview remain untouched. Changes belong to the concept module/style, the material helper and its documented art assets. No extra deadline, package/build system, unbounded effects or autoplay sound.

### Fidelity checks

Compare desktop, 390 and 320 rendered frames against the actual reference, including a motion frame. Reject stair-step silhouette gaps, detached tiny flame, rope-like cylindrical drips, plastic frame bubbles, square live backings and excessively hard shadows. Confirm tactile pores, warm flame/cool rim separation and real exhibit mounting at rest. Test actual reset/tally, pending/error/429, remote response, full-image preview/focus return, crown, reduced motion, resize and graphics loss. Renewed visual acceptance and actual runtime evidence are recorded in the report and shared QA.

The final cooled aperture rims use shallow irregular tube relief, reduced clearcoat (0.12, roughness 0.50), and matte wax base roughness 0.78. Molten flow/pool detail remains optically separate. At ≤360 px, physical exhibit frames and native pin widths both scale to 56%; the first exhibit centres at 57% rather than being clipped off the right edge. The canyon remains authored relief, not a free-orbit wax mesh.
