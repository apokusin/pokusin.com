# After the Flame

New exploration 1; numbered in the order displayed in the conversation.

Read the [shared implementation guide](../GUIDE.md) with this spec. Numerical settings are proposed art and performance targets, not measurements of implemented software.

![After the Flame visual reference](../references/after-the-flame.jpg)

### Premise

A candle burns toward the next countdown. Someone presses Again; the wax climbs upward and rebuilds it. Waiting becomes a beautiful, pointless ritual. The archive occupies the melted landscape itself, with the clock carved into its foreground. The deadline and press total remain shared across visitors.

### Art style and composition

Preserve the towering candle cropped against the left edge, burgundy void above, four recessed clock windows below, and stepped archive recesses rising on the right. This is a macro wax canyon, not a centered candle product shot. Let later archive groups inhabit further irregular terraces; retain breathing space around dark preview surfaces.

### Palette and typography

Wax `#EDE1C8`, night `#190D17`, flame amber `#E8872E`, restrained cool rim `#637A92`. Use Libre Baskerville for digits, Again, and show names; system sans for occasional navigation. Maximum two families. Visible copy is limited to identity, Countdowns, show/version names, D/H/M/S, Again, and the real press number.

### Geometry and materials

Use an authored low-poly canyon with normal/displacement detail baked into textures. Wax roughness varies from 0.3 on molten rivulets to 0.7 on cooled ledges. A thickness map supplies warm backlighting at thin edges; use wrapped diffuse or a small additive transmission approximation, not expensive volumetric scattering. Blackened wick and soot remain matte.

### Camera and lighting

A restrained perspective camera looks across the foreground at roughly 35 degrees downward. Normalize key/fill/rim contributions around 1:0.08:0.3: warm flame-local key, weak burgundy ambient fill, cool right-edge rim. Use one shadowed light, baked crevice AO, soft contact blobs under recesses, and small emissive bloom confined to flame. Timer surfaces must retain legible contrast.

### Interaction contract

Pointer proximity bends flame by at most 12 degrees; nearby ash follows a brief eddy. Focus or hover gently brightens a recess. Existing preview activation and modifier-click behavior remain intact. Again depresses during pending POST; success sends wax upward, rebuilds the wick, and updates reels. Failure restores the resting state without spectacle. A newer polled deadline produces only a subtle flame lift.

### Motion choreography

Idle flame has irregular, slow amplitude modulation. Normal changed digits roll in 420 ms. Successful reset reels use 1080 ms per digit with 45 ms column staggering (about 1.4 s overall) while a 1500 ms wax reversal rises, thickens, then settles. Separate cool-wax motion from fast ash. Never distort authoritative digits. Avoid camera shake, autoplay zooms, and forced scrolling.

### Effects and render budget

Start below 120k visible triangles, 70 draw calls, and 120 instanced ash particles. Cap DPR at 1.5 desktop/1.25 mobile; textures at 2K. Prefer a masked flame mesh and noise shader over fluid simulation. Target 60 fps desktop/30 fps mobile; disable bloom before simplifying the scene. Stop rendering when hidden or outside the viewport.

### Responsive and fallback behavior

Mobile retains a cropped candle at the edge, a two-by-two readable clock, Again directly beneath, and vertical wax recesses. Touch can bend flame but is unnecessary for navigation. Reduced motion freezes ash/flame and applies timer values immediately. No-WebGL uses exported art-only wax layers plus live DOM controls and actual previews.

### Implementation boundaries

Use vendored Three.js with DOM reels, semantic buttons, and archive links; no framework build. Gallery source remains generate.py. Do not alter archived sites or bake numbers into wax artwork. Add one tiny crown lodged in a foreground drip; keyboard or pointer activation reveals Long may I count. Preserve the current theme options.

### Fidelity checks

At first glance the left candle, four wax apertures, and ascending right archive terraces must read like the reference. Wet wax may shine; the entire scene must not become plastic. Check readable timer contrast, complete archive access, keyboard previews, pending/error states, successful reset, touch, reduced motion, and hidden-tab suspension.
