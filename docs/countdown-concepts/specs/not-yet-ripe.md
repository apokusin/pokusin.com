# Not Yet Ripe

New exploration 3; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. This revision supersedes the initial shallow material pass. Numerical settings are exact starting recipes to tune against actual desktop and phone renders; acceptance remains pending fresh browser review.

![Not Yet Ripe visual reference](../references/not-yet-ripe.jpg)

Art direction reviewed against the actual visual; see the [individual report](../reports/not-yet-ripe.md). The recommendations below are part of the implementation brief.

### Premise

Tomorrow is a strange botanical specimen. Four cut citrus pods carry the real clock; Again turns the skin green again. Old countdowns hang from the same branch as specimen papers. The visual language is a tactile botanical plate, with real anatomy and directional light.

### Art style and composition

Keep the diagonal woody branch, four cut citrus pods suspended beneath it, tags hanging at different heights, and the split fruit button lower-left. The reference mixes a botanical plate with tactile, imperfect specimens. Continue branching vertically into further show groups. Remove Latin captions and decorative prose; retain only faint unlabeled botanical drawings as texture.

Keep at least 85% of each flat preview and its entire title visible at rest. Leaves frame the tag; opening a leaf is a courtesy, never a content lock. The split-fruit rim has a clear concavity/contact shadow and a local press response. Omit the generated share-like symbol and preserve quiet chalk gaps between botanical masses.


Desktop fruit centres remain world x=−3.2/−0.3/2.6/5.5, y=0.30. While graphics are healthy, project the four genuine clock units directly onto these anatomical centres; do not approximate alignment with page percentages. Project Again and its real tally onto the split fruit in the same way. Phone recomposes the specimens into two pairs, and narrows only their geometry at ≤360 px. Graphics loss clears all projection styles and restores the independent illustrated DOM arrangement. Two upper photographs and two lower phone photographs remain flat, exposed and directly selectable; paper pivots around its string attachment. The crown stays in an open plant gap.

### Palette and typography

Chalk `#F1EAD8`, unripe green `#91BB27`, ripe saffron `#E5A834`, bruised plum `#492345`. The implemented pair is heavy Arial for the large edge title and tabular digits, plus Georgia for show labels and Again. Limit fonts to two families. Labels are small, intentional specimen identifiers, not scientific exposition or productivity badges.

### Geometry and materials

Fruit is an irregular half specimen, not a sphere with a coloured torus. Preserve a slightly pointed top/bottom profile and unequal left/right lobes. The peel has two scales of relief: a densely pitted 256 px pore field (bump 0.082 world units) and lower frequency dimples/scars built into the skin and irregular cut rim. Use base peel roughness 0.67 varying 0.54–0.84, clearcoat 0.16 / roughness 0.30, no metal. A multiplicative yellow/olive pore colour mask remains visible at both green and saffron deadline extremes; add only two or three authored bruises.

The cut face has a thick off-white pith ring, radial segment membranes that converge at a pale central core, and translucent pale citrus vesicles. A 512 px flesh colour/bump map supplies unequal elongated sacs and curved segment boundaries, with base roughness 0.44, bump 0.032 and warm edge tint. The cut face is a 26-ring / 96-segment relief surface, with 0.024 world-unit sac bulges and restrained unequal segment billow so directional light reveals actual flesh height. Vary membrane curvature and width from 0.004–0.009 world units instead of printing perfect spokes. The off-white pith rim varies in thickness by roughly 40% and rises/falls by 0.019 world units; it casts local contact shadow onto the flesh. Keep a few cream seeds around the outer third, away from the live glyphs. No perfect graphic wheel or saturated orange pulp. Stem collars and curved stalks visibly join each fruit to the branch.

Branch geometry uses tapered, ridged bark with dark crevices (roughness 0.92, bump 0.10); the existing art-only bark/leaf layer remains a distant silhouette, never a replacement for the attached foreground stems. Leaves are folded and slightly cupped with modeled central veins, fine secondary vein bump, waxy roughness 0.44 / clearcoat 0.20 and restrained thin-edge transmission. Papery specimen tags use off-white cotton grain, darkened hole edges, threaded loops and pale imperfect folds. Screenshots remain faithful and flat.

### Camera and lighting

Use the existing orthographic specimen camera, half-span 5.5 desktop / 6.4 phone. The chalk receiving plane sits at z=−2.4. A warm low upper-left key at (−6,8,10), strength 3.15, provides readable diagonal botanical shadows; cool olive hemisphere fill 0.72 and warm leaf-edge rim 0.60 establish key/fill/rim near 1:0.23:0.19. ACES exposure starts at 1.03. One 2048 desktop / 1024 phone variance shadow map, tight ±11 bounds, normal bias 0.025, blur radius 5 and 10 samples. Limit the transparent chalk shadow receiver to 11% density; its job is soft anchoring rather than dark duplicated fruit silhouettes.

Use a muted warm/cool PMREM environment for leaf wax and moist flesh only, intensity 0.35–0.45. Peel stays dry; pith stays matte. Skin contact, stem collars and leaf folds get local dark occlusion rather than dirtying every surface. The reference’s side light must reveal the flesh depth, bark ridges and waxy curved leaves at rest. No bloom, candy gloss, camera blur over tags or uniform ambient washing-out.

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

Final type clearance: desktop edge title uses clamp(50 px, 4.8 vw, 75 px), ending before the Again fruit. The 390/320 compositions retain their smaller separate title sizes. Decorative type must never cross the real action face.
