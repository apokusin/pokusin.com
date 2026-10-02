# Art direction review — Not Yet Ripe

Reviewed the actual [reference image](../references/not-yet-ripe.jpg), complete [spec](../specs/not-yet-ripe.md), and shared guide. This is an implementation critique, not a review of a working page.

## The compelling idea

The cut citrus interiors turn mechanical digits into strange specimens. The thick diagonal bark, suspended labels and long leaf shadows make it feel like an impossible botanical plate. Again inside a split fruit gives the reset a tactile home. The branch connecting clock and archive is more interesting than a set of floral decorations around cards.

## What needs to become intuitive

The image's Latin notes and share-like icon add explanation without helping the interaction; remove them. Foliage must frame labels, not hide archive navigation until a hover. Keep at least 85% of every flat preview and its whole title visible at rest. An opening leaf is a courtesy, not a lock on the content.

The bee can become a misleading game objective or follow the cursor too aggressively. Keep it a quiet, bounded secondary response: it never blocks a click, reveals an extra secret or asks to be caught. Focus should open a tag's nearest leaf immediately, without waiting for the bee.

## Exact feel and state direction

- Hanging tags should react first at the string attachment, then flex at their paper corners. Maximum body rotation is 2° and displacement 6 px; focused tags become still. This keeps the image readable and suggests weight rather than generic card hover.
- Pending Again flexes the fruit rim by 2 px without changing peel color or branch length. On success, an uneven green front spreads from the reset fruit through the four clock pods over 1500 ms. The existing reels run concurrently; pale fruit interiors and screenshots remain unchanged.
- Decorative ripeness derives only from the current deadline's remaining fraction of its preceding calendar month. The exact accessible digits remain authoritative; never invent a separate stored progress state. Even near full time, keep pores, yellow scars and bruised accents so the fruit does not turn into four flat green lights.
- A brief tip extension may acknowledge success, limited to one existing segment and 8% of its length, then settling back. Repeat presses retarget the same branch and color front, with no accumulating growth or new tags. Remote updates allow a 300 ms leaf flutter; errors release the fruit rim and preserve its state.
- Idle sway travels from branch to twig to leaf with 100–180 ms lag between levels. Keep it under 1° at the main branch and under 3° at tips. No automatic harvest, falling fruit or camera movement.

## Discovery and the one easter egg

The folded leaf shown near the lower-right clock is the sole secret. A small gold notch peeks through; hover/focus opens it enough to show a tiny crown, and tap/Enter reveals “Long may I count.” inside the fold. The 44 px semantic target stays reachable among tags. Do not require a bee interaction or a particular ripeness to find it.

## Assets and execution risk

The branch must have varied bark thickness and believable string attachments; identical cylinders will look like a toy vine. Author citrus half silhouettes with a pale radial interior, pore normals and separate peel masks. Supply art-only leaf/branch fallback layers and faint unlabelled drawing textures. Keep screenshot content and clock reels independent of those assets.

## Must preserve and prove

Preserve oversized bark, four citrus cross-sections, hanging specimens, plum digits and the split fruit action. The reset should read as un-ripening from one observed press. Test peel reversal, visible tag access without hover, first-touch behavior, focus, previews, rejected and remote resets, repeated bounded growth, reduced motion and narrow-screen legibility. The visual joke should live in botany rather than explanatory copy.

## Implementation addendum

A newly generated transparent **art-only** bark/leaf layer, `assets/concepts/not-yet-ripe/branch.webp` (about 394 KB), carries the irregular diagonal branch silhouette. The adjacent provenance file records the production prompt/source. It contains no fruit, photographs, text or controls. Actual Three.js citrus halves, pore bump, pale radial flesh shader, separate peel, curved twigs, folded/veined leaves, bounded bee and leaf-hidden crown remain interactive. Early flat floating leaves were moved onto the branch and given modeled folds/vein shading. Live digits and actual screenshots are never part of the art asset.

Desktop fruit centers were lowered to world y=.30; the DOM clock starts at 39.5%. Both top prints are now at 6%, with 23%/26% widths, so the entire fruit row remains exposed. Phone uses two pairs, a 52.5% reset region and separated lower paper mounts; paper rotates around its string attachment rather than its center. The sole crown is between exhibits rather than under a photo, and has the same immediate focus/tap discovery in reduced motion. Calendar ripeness is computed from the actual remaining digits and the preceding clamped UTC month; it has no stored progress or backend changes. Georgia/Arial replace the earlier third typeface.

At 320 px, a final comparison exposed the cropped left fruit and title/glyph collision. The narrow breakpoint now shifts and reduces only the four fruit meshes, narrows the title to 36 px and leaves a 12 px minimum reading gap; both phone widths place live digits at 29% to sit within the flesh.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the final desktop, 390 px and 320 px captures against this spec. Irregular bark and pale hanging tags establish a specimen plate; the plum clock reads inside four radial citrus interiors. Both phone widths preserve complete fruit silhouettes and visible digits. The 320 px title clears the first glyph and remains an edge accent. The first hanging print and split-fruit Again/tally stay exposed without a leaf-uncovering step. The supplied archive continuation captures preserve strings, specimen labels and an angled branch rail with generous gaps.

**Code-reviewed feel:** Remaining calendar time determines a bounded peel color; it is independent of the real digit renderer and creates no additional persistent state. Confirmation changes the existing peel/twig transforms, remote updates produce a brief leaf response, and focused archive content suppresses secondary motion. The folded-leaf crown opens directly on focus even under reduced motion. Source establishes these mechanisms; static captures do not prove the complete un-ripening sequence or physical-phone performance.

**Fidelity decision:** Accept the separate art-only branch layer and restrained modeled leaf/citrus geometry. They preserve the oversized botanical silhouette while leaving actual screenshots, values and controls independent. No remaining P0/P1/P2 visual defect was identified in the supplied final compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.
