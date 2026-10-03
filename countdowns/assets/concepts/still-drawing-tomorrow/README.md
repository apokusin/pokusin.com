# Drawing assets

`graphite-ink.svg` is authored locally for the live digit texture. It contains only graphite hatch and noise, with no baked digits, labels or UI.

`caveat-variable.ttf` is the Caveat variable handwriting typeface from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/caveat), retrieved October 2, 2026. It is distributed unchanged under the included [SIL Open Font License](Caveat-OFL.txt). The page self-hosts it so the handwriting is consistent across platforms. Barlow Condensed is the other selected UI family and is already loaded by the site.

The rebuilt physical table and reproducible Blender source are documented in
[scene/README.md](scene/README.md). Its ten isolated graphite digit shapes and
twelve runner poses are ImageGen art masters, independent from real clock/ink
state. The guttered runner-cycle-spaced.png is a local derivative of the retained
runner-cycle.png, not another generation. Exact file hashes, retained-source
relationships and clearly labeled reconstructed generation briefs are in
[scene/artwork/provenance.json](scene/artwork/provenance.json). The paper stock
study retains its [exact original prompt](paper-stock.provenance.md); procedural
maps supply the rebuilt table’s current material channels. No scene screenshot
or live deadline is baked into these masters.
