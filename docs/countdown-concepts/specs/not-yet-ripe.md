# Not Yet Ripe

New exploration 3; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![Not Yet Ripe visual reference](../references/not-yet-ripe.jpg)

Art direction reviewed against the actual visual; see the [individual report](../reports/not-yet-ripe.md). The recommendations below are part of the implementation brief.

### Premise

Tomorrow is nearly ripe. Again turns its fruit green and adds another month of waiting. This gag must be visible through the changing fruit skin, with no explanatory paragraph. The archive is a collection of specimen tags hanging from the same oversized branch; time is a strange botanical harvest.

### Art style and composition

Keep the diagonal woody branch, four cut citrus pods suspended beneath it, tags hanging at different heights, and the split fruit button lower-left. The reference mixes a botanical plate with tactile, imperfect specimens. Continue branching vertically into further show groups. Remove Latin captions and decorative prose; retain only faint unlabeled botanical drawings as texture.

Keep at least 85% of each flat preview and its entire title visible at rest. Leaves frame the tag; opening a leaf is a courtesy, never a content lock. The split-fruit rim has a clear concavity/contact shadow and a local press response. Omit the generated share-like symbol and preserve quiet chalk gaps between botanical masses.


Implemented desktop centers are world x=-3.2/-0.3/2.6/5.5, y=.30, with live clock left 22%, top 39.5%, width 70%. Two hanging upper photographs start at 6% with 23%/26% widths, exposing every digit. Phone uses two fruit pairs with live digits at 29%, reset at 52.5%, and separated lower mounts at 66.5%/83%. At widths ≤360 px the vertical title becomes 36 px, clock shifts to left 19%/width 68%, and only the four fruit meshes shrink 14% and shift right to leave at least 12 px between title and first glyph. Decorative paper pivots around the string attachment; the crown stays in an open plant gap.

### Palette and typography

Chalk `#F1EAD8`, unripe green `#91BB27`, ripe saffron `#E5A834`, bruised plum `#492345`. The implemented pair is heavy Arial for the large edge title and tabular digits, plus Georgia for show labels and Again. Limit fonts to two families. Labels are small, intentional specimen identifiers, not scientific exposition or productivity badges.

### Geometry and materials

Use authored branch curves with instanced leaves and irregular citrus halves. Peel gets a pore normal map, dry roughness 0.55–0.8, and uneven green/yellow masks. Pale flesh has thin-edge warm scattering from thickness maps; seed shapes remain subtle. Paper tags are slightly bent planes on string curves. Keep the real clock as DOM reels over pale fruit interiors, not shader-generated text.

Vary bark thickness and model believable string attachments; identical cylinders are not the branch silhouette. Citrus needs a pale radial interior, distinct peel mask and authored half shape. Keep yellow scars, pores and bruised plum accents even when the reset greens the skin. Digits and screenshot surfaces are rigid regions excluded from foliage, peel tint and tag deformation.


Runtime asset: `countdowns/assets/concepts/not-yet-ripe/branch.webp`, an art-only transparent bark/leaf layer generated with the built-in ImageGen tool. Read its adjacent provenance file for the exact prompt/source. All fruit, crown, numbers, photographs and controls are separate geometry/DOM. The layer also preserves the branch in static fallback.

### Camera and lighting

Use an orthographic botanical camera with shallow layered depth. Key/fill/rim around 1:0.28:0.18: broad low afternoon key, cool leafy fill, warm leaf-edge rim. One soft shadow light creates legible leaf shadows on chalk. Bake branch crevice AO; use a restrained wrapped-light leaf shader. Avoid glossy candy highlights and shallow focus over interactive tags.

### Interaction contract

Pointer attracts one small bee within a bounded region; it stays secondary, cannot block clicks and is not a collectible or additional secret. Focus or hover opens the nearest visible modeled leaf to the tag's string attachment: it turns up to 0.9 radians out of the image plane with a small outward splay. Keyboard focus does so immediately, including under reduced motion; hover approaches with about 80 ms damping. Both hold secondary specimen sway still. The leaf is a visible courtesy, while at-rest photographs remain exposed and every part of the flat image is a normal preview link. Show-index links move to branches through regular scrolling.

Pending Again flexes the fruit rim 2 px without changing peel color or branch length. Confirmed success sends a green front from the reset fruit across the four clock pods and briefly extends one existing branch tip. Failure releases the rim with no ripening change and uses the reserved short status. Repeats retarget the same bounded segment/front; they never add tags or cumulative geometry. Remote updates create only a 300 ms leaf flutter while digits/tally update truthfully.

Decorative resting ripeness follows the current deadline's remaining fraction of the one preceding UTC calendar month, clamped to 0–1. Compute it from the shared deadline, not another stored progress state; shorter remaining time tends toward saffron, full time toward green. Preserve irregular masks/scars at both extremes and never present this color as a more precise timer. Authoritative accessible digits remain independent and immediate.

The sole secret is a folded leaf near the clock with a small gold notch visible. Hover/focus on its 44 px semantic target opens the fold enough to show a crown; tap/Enter reveals “Long may I count.” inside it. Pointer departure must not close a keyboard-focused fold. Neither the bee nor a particular ripeness is required for discovery.

### Motion choreography

Idle sway propagates from branch to twig to leaf with 100–180 ms lag between levels; keep the main branch under 1° and tips under 3°. Hanging tags respond first at the string attachment then the paper corners, with maximum rotation 2° and displacement 6 px. Focus keeps them still. The bee does not orbit the pointer continuously.

Normal digit changes roll for 420 ms; successful reset reels use 1080 ms per digit and 45 ms column staggering, settling left to right over about 1.4 s overall. Concurrently the uneven green front spreads over 1500 ms of **visible scene time**. Opening a preview freezes its current peel colors and tip transform; closing resumes the remaining reversal from that exact phase rather than skipping to an elapsed wall-clock endpoint. A repeat snapshots the currently displayed peel colors and restarts the same bounded front. Pale interiors/screenshots stay unchanged. The tip extension peaks at 8% of one existing segment's length and settles back; no permanent growth or allocation. No automatic scroll, harvesting animation, falling preview tags or camera motion.

### Effects and render budget

Start below 100k visible triangles, 65 draw calls, 100 instanced leaves, one bee, and 40 short-lived pollen specks. Cap DPR at 1.5 desktop/1.25 mobile. Prefer a peel color-mask shader and procedural sway over skeletal animation or cloth physics. Target 60/30 fps. Drop pollen and secondary leaves first; pause offscreen/hidden rendering.

### Responsive and fallback behavior

Mobile follows one climbing branch, arranges fruit into two readable pairs, and spaces tags vertically. The split-fruit button stays beside the tally, not behind foliage. Touch and keyboard reveal tags without hover dependence. Reduced motion uses still specimens and immediate digit values. Static fallback exports branch/fruit art without screenshot or number pixels, then overlays live DOM content.

Keep first-touch activation direct: no first tap to uncover a leaf before a second tap opens the archive. Native scroll works through plant gaps and paper. At 320 px, crop the large decorative title before reducing specimen previews. Static fallback preserves bark, citrus halves, hanging strings and chalk leaf shadows; the crown still has a tap/focus equivalent.

### Implementation boundaries

Implement with vendored Three.js, generated DOM, existing reels/API, and actual SHOWS content. Keep all show versions and timeline links accessible. Do not reproduce generated screenshot artifacts or fake botanical metadata. Implement only the folded-leaf crown described above. Decorative ripeness can reflect the deadline but cannot mutate API truth or become a separate persistent state.

### Fidelity checks

The citrus cross-sections, diagonal bark, visible strings, and pale specimen tags should dominate. Avoid a tropical landing page, gum-like surfaces, neat card grid, or dense museum labels. Test peel reversal after success, failures, remote update restraint, readable fruit interiors, complete tag access, keyboard preview closure, and reduced-motion stills.

One successful reset should visibly un-ripen the peel. Check at-rest tag visibility without hover, one-touch full-photo activation, bee clearance, real deadline/color extremes, non-accumulating repeat growth, a still focused specimen, restrained remote response, accessible fold discovery, and the art-only fallback.
