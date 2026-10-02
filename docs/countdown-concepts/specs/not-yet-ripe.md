# Not Yet Ripe

New exploration 3; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Not Yet Ripe visual reference](../references/not-yet-ripe.jpg)

### Premise

Tomorrow is nearly ripe. Again turns its fruit green and adds another month of waiting. This gag must be visible through the changing fruit skin, with no explanatory paragraph. The archive is a collection of specimen tags hanging from the same oversized branch; time is a strange botanical harvest.

### Art style and composition

Keep the diagonal woody branch, four cut citrus pods suspended beneath it, tags hanging at different heights, and the split fruit button lower-left. The reference mixes a botanical plate with tactile, imperfect specimens. Continue branching vertically into further show groups. Remove Latin captions and decorative prose; retain only faint unlabeled botanical drawings as texture.

### Palette and typography

Chalk `#F1EAD8`, unripe green `#91BB27`, ripe saffron `#E5A834`, bruised plum `#492345`. Use condensed system sans for the large edge title and digits; Libre Baskerville for show labels and Again. Limit fonts to two families. Labels are small, intentional specimen identifiers, not scientific exposition or productivity badges.

### Geometry and materials

Use authored branch curves with instanced leaves and irregular citrus halves. Peel gets a pore normal map, dry roughness 0.55–0.8, and uneven green/yellow masks. Pale flesh has thin-edge warm scattering from thickness maps; seed shapes remain subtle. Paper tags are slightly bent planes on string curves. Keep the real clock as DOM reels over pale fruit interiors, not shader-generated text.

### Camera and lighting

Use an orthographic botanical camera with shallow layered depth. Key/fill/rim around 1:0.28:0.18: broad low afternoon key, cool leafy fill, warm leaf-edge rim. One soft shadow light creates legible leaf shadows on chalk. Bake branch crevice AO; use a restrained wrapped-light leaf shader. Avoid glossy candy highlights and shallow focus over interactive tags.

### Interaction contract

Pointer attracts one small bee within a bounded region; nearby leaves tilt with delayed response. Focus or hover opens the nearest leaf to clear a tag. Tags activate existing previews. Show-index links move to branches through regular scrolling. Again flexes the cut fruit during pending POST. Success sends a green color front across peels and extends one branch segment; failure restores it. Remote updates create only a modest leaf flutter.

### Motion choreography

Idle sway propagates from main branch to tips rather than moving everything together. Normal digit changes roll for 420 ms; successful reset reels use 1080 ms per digit and 45 ms column staggering, settling left to right over about 1.4 s overall. The ripening reversal spreads unevenly over about 1500 ms, then holds. The extra segment is visual staging, not a forever-growing memory allocation. No automatic scroll, harvesting animation, or falling preview tags.

### Effects and render budget

Start below 100k visible triangles, 65 draw calls, 100 instanced leaves, one bee, and 40 short-lived pollen specks. Cap DPR at 1.5 desktop/1.25 mobile. Prefer a peel color-mask shader and procedural sway over skeletal animation or cloth physics. Target 60/30 fps. Drop pollen and secondary leaves first; pause offscreen/hidden rendering.

### Responsive and fallback behavior

Mobile follows one climbing branch, arranges fruit into two readable pairs, and spaces tags vertically. The split-fruit button stays beside the tally, not behind foliage. Touch and keyboard reveal tags without hover dependence. Reduced motion uses still specimens and immediate digit values. Static fallback exports branch/fruit art without screenshot or number pixels, then overlays live DOM content.

### Implementation boundaries

Implement with vendored Three.js, generated DOM, existing reels/API, and actual SHOWS content. Keep all show versions and timeline links accessible. Do not reproduce generated screenshot artifacts or fake botanical metadata. Hide one small crown inside a folded leaf; accessible activation reveals Long may I count. Never tie real API truth to decorative ripeness.

### Fidelity checks

The citrus cross-sections, diagonal bark, visible strings, and pale specimen tags should dominate. Avoid a tropical landing page, gum-like surfaces, neat card grid, or dense museum labels. Test peel reversal after success, failures, remote update restraint, readable fruit interiors, complete tag access, keyboard preview closure, and reduced-motion stills.
