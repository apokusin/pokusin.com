# Countdown worlds

Eight art directions for the countdown archive: two retained references, five new material worlds, and an additional third-person exploration developed by a subagent. Prepared October 2, 2026. These are concepts; no new theme has been selected or implemented.

Every brief uses the same eleven sections: premise, composition, palette/type, geometry/materials, camera/lighting, interaction, motion, effects/budget, responsive/fallback behavior, implementation boundaries, and fidelity checks. Read the [shared implementation guide](GUIDE.md) before a selected brief. It preserves the real shared countdown, digit reels, archive content, preview interaction, and minimal copy.

## New explorations

Numbers match the order in which the six new images appeared in the conversation. The earlier references remain outside this numbering.

| Option | Concept and complete spec | Art and layout | Interaction and confirmed-reset gag |
| --- | --- | --- | --- |
| 1 | [After the Flame](specs/after-the-flame.md) | Dramatic ivory wax canyon, burgundy darkness, archive recesses in irregular terraces | Bend the flame; wax rises to rebuild the candle |
| 2 | [Low Tide, Later](specs/low-tide-later.md) | Cyanotype shoreline, chalk timer cylinders, photographic sheets along a diagonal tide edge | Trace ripples; an incoming wave postpones emergence |
| 3 | [Not Yet Ripe](specs/not-yet-ripe.md) | Botanical specimen plate, oversized citrus clock pods, tags on one branching structure | Open leaves; fruit turns green again |
| 4 | [Still Drawing Tomorrow](specs/still-drawing-tomorrow.md) | Sunlit animation table, layered acetate, graphite and stepped drawn poses | Lift cels; an eraser removes and redraws the finish |
| 5 | [Held in Suspense](specs/held-in-suspense.md) | Monumental chrome cantilever, stone anchor, suspended archive and timer plates | Comb iron filings; a counterweight restores the unfinished balance |
| 6 | [The Almost Fair](specs/the-almost-fair.md) | Low-poly third-person fairground, seven physical exhibition pavilions, cream/jade/coral palette | Walk, orbit, or travel directly; a plunger rewinds the fair’s clock and interrupts its opening ceremony |

### 1. After the Flame

![After the Flame](references/after-the-flame.jpg)

[Complete spec](specs/after-the-flame.md)

### 2. Low Tide, Later

![Low Tide, Later](references/low-tide-later.jpg)

[Complete spec](specs/low-tide-later.md)

### 3. Not Yet Ripe

![Not Yet Ripe](references/not-yet-ripe.jpg)

[Complete spec](specs/not-yet-ripe.md)

### 4. Still Drawing Tomorrow

![Still Drawing Tomorrow](references/still-drawing-tomorrow.jpg)

[Complete spec](specs/still-drawing-tomorrow.md)

### 5. Held in Suspense

![Held in Suspense](references/held-in-suspense.jpg)

[Complete spec](specs/held-in-suspense.md)

### 6. The Almost Fair

![The Almost Fair](references/the-almost-fair.jpg)

[Complete spec](specs/the-almost-fair.md)

The third-person reference establishes the player, branching promenade, and clock landmark. Its incidental photographic textures, trees, stairs, ornate trim, and large crowns are excluded from the implementation direction. The brief specifies flat matte colors, simple faceted architecture, restrained contact occlusion, step-free access, and one hidden crown. Its exhibit mapping and mono clock typography take priority over the image’s invented details.

## Retained references

### Tomorrow’s Roadworks

![Tomorrow’s Roadworks](references/tomorrows-roadworks.jpg)

[Complete spec](specs/tomorrows-roadworks.md): cobalt road loops, dusty pink concrete, orange machinery, archive billboards; a successful press unrolls another stretch of tomorrow.

### Bubblegum Time

![Bubblegum Time](references/bubblegum-time.jpg)

[Complete spec](specs/bubblegum-time.md): mint space, a diagonal glossy gum clock, a cropped balloon, and curling archive prints; a successful press inflates and stretches the connected sculpture.

## Reference provenance

The images are independent ImageGen explorations, not screenshots of functioning software. JPG references preserve native composition and dimensions without resizing. Their numbers, incidental copy, and invented thumbnail details are placeholders; implementation uses real archive content and authoritative live values.

[Generation prompts](prompts.json) record the exact prompts for the six new explorations and identify the actual archive content used as grounding. [The manifest](manifest.json) records stable concept IDs, displayed order, dimensions, and original/reference checksums. The earlier two images are preserved as prior-round references; their exact original prompts are not reconstructed here.

The original generated PNGs remain in the generating task’s image store. Portable references are kept here so later agents do not depend on that local store. The next step is a human choice of concept; these documents do not authorize a blend of directions or a new implementation.
