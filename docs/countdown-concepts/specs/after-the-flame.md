# After the Flame

New exploration 1; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![After the Flame visual reference](../references/after-the-flame.jpg)

Art direction reviewed against the actual visual; see the [individual report](../reports/after-the-flame.md). The recommendations below are part of the implementation brief.

### Premise

A candle burns toward the next countdown. Someone presses Again; the wax climbs upward and rebuilds it. Waiting becomes a beautiful, pointless ritual. The archive occupies the melted landscape itself, with the clock carved into its foreground. The deadline and press total remain shared across visitors.

### Art style and composition

Preserve the towering candle cropped against the left edge, burgundy void above, four recessed clock windows below, and stepped archive recesses rising on the right. This is a macro wax canyon, not a centered candle product shot. Let later archive groups inhabit further irregular terraces; retain breathing space around dark preview surfaces.

Again sits in a shallow finger-sized concavity with a distinct rim, contact shadow and local sheen; its engraving alone is insufficient. Show the first archive recess within the initial composition. Continue terraces along a readable native-scroll route. Wax frames the whole target and title without hiding either, and the void remains genuinely quiet.


The authored art-only canyon supplies the reference perspective, with an orthographic physical overlay for flame/light/reverse flow. Desktop live apertures start at left 34%, top 66%, width 53%; the title sits at 92 px below Worlds. The upper Game of Thrones caption sits immediately above its recess, avoiding overlap from the neighboring Severance/Dexter mounts; other captions remain below. Phone keeps two clock pairs and positions the lower photographs at 65% and 81% of a 1190 px hero. Reverse-flow meshes are completely hidden at rest.

### Palette and typography

Wax `#EDE1C8`, night `#190D17`, flame amber `#E8872E`, restrained cool rim `#637A92`. The implemented pair is Georgia for digits, Again and show names, plus Arial for occasional navigation/status. Maximum two families. Visible copy is limited to identity, Countdowns, show/version names, D/H/M/S, Again, and the real press number.

### Geometry and materials

Use an authored low-poly canyon with normal/displacement detail baked into textures. Wax roughness varies from 0.3 on molten rivulets to 0.7 on cooled ledges. A thickness map supplies warm backlighting at thin edges; use wrapped diffuse or a small additive transmission approximation, not expensive volumetric scattering. Blackened wick and soot remain matte.

Authored contours must include irregular ledges, drips, four aperture frames and the towering candle silhouette. This cannot be faithfully substituted by a cluster of smooth cylinders. Separate flame mask, wax normal/thickness map, crevice AO and art-only static layers from all live DOM content. Mark rigid exclusion regions for timer faces, screenshot centers, labels and action targets.


Runtime asset: `countdowns/assets/concepts/after-the-flame/canyon.webp`, an art-only transparent layer generated with the built-in ImageGen tool. Read its adjacent provenance file for the exact prompt/source. No flame, crown, text, numbers or preview pixels are baked in; these remain separate geometry/DOM. The same art layer supports static fallback.

### Camera and lighting

A restrained perspective camera looks across the foreground at roughly 35 degrees downward. Normalize key/fill/rim contributions around 1:0.08:0.3: warm flame-local key, weak burgundy ambient fill, cool right-edge rim. Use one shadowed light, baked crevice AO, soft contact blobs under recesses, and small emissive bloom confined to flame. Timer surfaces must retain legible contrast.

### Interaction contract

Pointer proximity bends flame by at most 12 degrees; nearby ash follows a brief eddy. Focus or hover warms just a recess edge and lifts its flat preview surface 2 px. The entire image remains a normal link; existing preview activation and modifier-click behavior remain intact. Keyboard focus gives the pool/recess its material light response plus an ordinary high-contrast outline. No heating, drag or flame gesture is necessary for navigation.

Pending Again depresses the pool 2 px and narrows its highlight while keeping wax fixed. Only confirmed POST success sends wax visibly upward against gravity, rebuilds the wick and updates reels. Failure releases the pool over 180 ms, leaves wax unchanged and uses the reserved short status. Repeated successes retarget one bounded reversal without accumulating geometry or candle height. A newer polled count gives only a small flame lift over 400 ms.

The one crown is lodged in the foreground drip, with a small gold edge visible. Give its 44 px semantic target a tiny warm pool on hover/focus; tap/Enter makes a 5° bow and reveals Long may I count. locally for a dismissible beat. It is not an ash collection or cursor-trail game.

### Motion choreography

Idle flame has irregular, slow amplitude modulation and a tiny wick glow. The canyon does not continuously melt or promise persistent material change. Normal changed digits roll in 420 ms. Successful reset reels use 1080 ms per digit with 45 ms column staggering (about 1.4 s overall) concurrently with one 1500 ms wax reversal.

That reversal starts at Again: an amber vein travels toward the candle during the first 250 ms; viscous ridges climb for 1100 ms; the wick arch reforms before the 1500 ms settle. Rebuilt height peaks at 12–18% of the visible candle, then returns to the authored resting silhouette. Flow must climb rather than merely inflate. Keep the four clock faces and previews rigid and unobscured. Separate cool-wax motion from fast ash, stop recess motion on focus, and avoid camera shake, autoplay zooms or forced scrolling.

### Effects and render budget

Start below 120k visible triangles, 70 draw calls, and 120 instanced ash particles. Cap DPR at 1.5 desktop/1.25 mobile; textures at 2K. Prefer a masked flame mesh and noise shader over fluid simulation. Target 60 fps desktop/30 fps mobile; disable bloom before simplifying the scene. Stop rendering when hidden or outside the viewport.

### Responsive and fallback behavior

Mobile retains a cropped candle at the edge, a two-by-two readable clock, Again directly beneath, and vertical wax recesses. Touch can bend flame but is unnecessary for navigation. Reduced motion freezes ash/flame and applies timer values immediately. No-WebGL uses exported art-only wax layers plus live DOM controls and actual previews.

Preserve rim/shadow affordance for Again and a visible first recess on phone. Static wax layers must retain the monumental left mass, carved apertures and ascending ledges, without burned-in text or photographs. Crown discovery remains a 44 px focus/tap action. Background highlights cannot reduce the contrast of status, show titles or digits.

### Implementation boundaries

Use vendored Three.js with DOM reels, semantic buttons, and archive links; no framework build. Gallery source remains generate.py. Do not alter archived sites or bake numbers into wax artwork. Implement the single foreground crown described above; no additional collectible or secret. Preserve the current theme options.

### Fidelity checks

At first glance the left candle, four wax apertures, and ascending right archive terraces must read like the reference. Wet wax may shine; the entire scene must not become plastic. Check readable timer contrast, complete archive access, keyboard previews, pending/error states, successful reset, touch, reduced motion, and hidden-tab suspension.

From one successful press, upward reversal against gravity must be recognizable without copy. Verify button readability at rest, no flowing wax over targets, non-accumulating repeated resets, restrained remote response, a still focused preview, equivalent crown discovery, and a fallback that retains the canyon silhouette.
