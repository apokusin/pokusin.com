# Art direction review — Still Drawing Tomorrow

## Current status — architecture reset, October 2, 2026

**Current implementation rejected by the user. All prior visual acceptance and “accepted source limitation/interpretation” verdicts below are withdrawn and retained only as a historical record.** Those verdicts incorrectly reduced the original concept's ambition to fit the implementation. Functional/API/preview checks remain historical functional evidence; they do not establish visual fidelity.

The original reference is the authority. The replacement [scene-first spec](../specs/still-drawing-tomorrow.md) and [architecture proposal](../architecture/installations.md) are **planned, not implemented**. Their first gate is a final-lit material/geometry/content slice compared directly with the original before navigation and secondary effects. The accepted Fair remains unchanged. No new visual acceptance is claimed.

## Historical development record — superseded

## Final renewed independent review — October 2, 2026

**Visual result: accepted.** An independent art-director subagent inspected the actual reference, fresh desktop pair and both phone widths. No unresolved P0/P1/P2 visual defect remained in that evidence.

Unequal sheet sizes, rotations and depths replace the earlier tidy row. Real cotton texture, window light, registration strokes, pencil props and a scored eraser create a worktable. Lowering the phone eraser grounds its shadow. The separate corner lift opens no preview, and its targets hide after graphics loss.

**Published-load correction:** Actual Cloudflare first paint exposed an undecoded map briefly darkening the table. Warm procedural stock now remains until the raster is decoded. Both blocked-image and uncached first-frame screenshots retain the warm scene; this is observed loading behavior, not inferred from configured materials.

**Accepted source limitation:** Paper/cel surfaces, runner anatomy and wear are cleaner and simpler than the reference's worn translucent acetate. This is the documented rendered interpretation, not a claim of photographic source equivalence.

Evidence: [reference/current](../qa/still-drawing-tomorrow-material-comparison.jpg), [1280 × 900](../qa/still-drawing-tomorrow-material-desktop.jpg), [390 × 844](../qa/still-drawing-tomorrow-material-mobile.jpg), [320 × 720](../qa/still-drawing-tomorrow-material-320.jpg). Root separately verified real phone resets 386 → 393 across all seven, genuine archive preview/Escape/focus restoration, 44 px or larger targets, no document overflow, reduced-motion crown discovery and actual graphics-loss restoration. [Shared runtime QA](../../../design-qa.md) distinguishes native checks from still-image review; no hardware FPS or physical touch-device result is implied.

The implementation-stage observations below record the development and correction of these surfaces; earlier pending/historical acceptance is superseded by this final review.

## Material revision — October 2, 2026

The fresh 1280 × 900 published baseline (`rigor-before-still-drawing-tomorrow.png`) confirms the previous acceptance understated the gap: paper is almost uniform beige, acetate is a second rectangular container, and the eraser is clean plastic. This revision supersedes that material acceptance while retaining the genuine archive and timing checks.

The new recipe distinguishes fibrous matte paper, scored rubber, directional wood and thin reflected acetate. A warm window key and cool fill now reveal thickness; generated PMREM window cards reflect on the acetate instead of painting a universal glare. Separate backing sheets anchor the archive, and healthy DOM surfaces contribute only ink and faithful work. Window bands, crumbs and shavings are localized rather than adding generic noise to everything.

First actual render exposed overly dark window bands and an opaque shadow from a transparent registration plane. Those are P2 defects: softer VSM shadows, fewer mullions and excluding transparent planes from the shadow pass correct the cause. Final source/reference comparison, phone review and native reset/lift checks are pending the post-fix captures; no current acceptance or hardware performance is claimed yet.

---

## Historical review

Reviewed the [actual image](../references/still-drawing-tomorrow.jpg), [spec](../specs/still-drawing-tomorrow.md), and shared guide. This is a pre-implementation review; the recommendations below have been incorporated into the spec.

## Creative judgment

This is the most human of these four directions. The graphite, translucent cels and eraser imply effort repeatedly spent on a finish that never arrives. Its strength is the contrast between time's mechanically exact numbers and animation's handmade revisions. The runner can deliver a visual punchline: the finish retreats precisely when the runner is about to reach it.

Do not let “paper theme” become beige cards, tape stickers and handwritten labels. The image works as a broad animator's worktable: the four-part clock sheet is physically connected, the archive lives in layered cels, and red/blue registration ghosts indicate a drawing being revised. Preserve those material relationships and remove incidental margin jokes.

## Visual strengths to protect

- The wide clock cel gives time the visual scale of a drawing under examination.
- Transparent edges and registration holes make archive sheets feel deliberately mounted.
- The worn red eraser is an unmistakable tactile reset object.
- The graphite running loop provides an expressive line rather than another container.
- Shallow daylight and a few curled corners give depth without a scenic backdrop.

The crown should hide under a single corner. More illustrated jokes on margins would dilute the pleasure of finding it.

## Friction and invisible-feel risks

Tabs currently become visible only when a stack separates on hover. That hides the archive from phone users and makes the scene feel decorative. Show at least one named tab protruding from every group at rest. A small curled corner suggests lift; the primary rectangular preview remains immediately clickable. Lifting a corner must not consume the preview action or move the target beneath the pointer.

A cursor pencil trail invites visitors to think they can draw. Keep it short, subtle and decorative, with no pen toolbar, lasting stroke or false editing promise. The normal pointer remains visible. Keyboard focus receives an authored underline with the same material language.

A constantly running figure could make the page feel anxious or noisy. The runner needs anticipation and pauses, not an endless screensaver. Idle performs a short unfinished loop once per twelve seconds; the reset sequence gets the full clear joke. Phones and reduced motion omit idle cycles.

## Feel decisions incorporated

At rest, the runner stops one pose before a finish stripe. Pressing the eraser compresses it over 100 ms and draws no mark while waiting. On confirmed success, a 600 ms erase sweep removes the stripe, then a 900 ms redrawing extends the same path beyond the runner. The runner advances through twelve intentional poses per second, briefly anticipates the old finish, and lands in the new almost-finished pose. Its motion is a discrete illustrated rhythm; the cel lift and overlay remain smooth.

Cel tabs lift 6 px and rotate no more than two degrees over 180 ms, with a 260 ms return. The actual preview rectangle does not translate, and lifting pauses while focus or a pointer remains on its actionable region. Touch activation of the corner reveals the next tab without opening a site; tapping the preview itself opens the real overlay. Each tab is also a ordinary show link, and normal document order remains intact.

The implementation retains fixed red/blue cel registration behind genuine live glyphs and keeps onion-skin pose ghosts on the runner path. It intentionally omits animated duplicate clock outlines: the shared reels carry numerical change, while the authored registration marks preserve the handmade drawing language without reducing legibility. Red/blue accents are registration marks, not success/error colors. Remote updates advance only one runner pose and update the true numerical state. Errors release the eraser and retain the finish stripe.

## Asset and implementation direction

Create authored vector graphite strokes, a twelve-pose runner, finish stripe and erase/reveal masks. A clean geometric running figure is acceptable if its anatomy and pose rhythm are intentional; a bouncing dot is not. Paper fiber and worn eraser detail should be lightweight textures, while transparent edges get real shallow geometry. Do not use the generated mock as a flat background carrying fake controls or baked numbers. Actual preview captures sit inside the cel boundaries.

## Art acceptance gates

The archive is visible before hover, and an unfamiliar visitor can open a preview without discovering a corner trick. At success, the finish stripe visibly moves away rather than simply flashing. The runner has hold poses, the eraser has pressure, and the cel has distinct smooth motion. Overlapping transparent layers never hide active labels. Phone composition still feels like sheets on a worktable, and reduced motion retains the drawing language with immediate real values.

## Implemented art pass

The implementation authors paper fibers, registration marks and twelve runner poses as bounded canvas textures, plus a local `graphite-ink.svg` surface clipped inside real live digit glyphs. These textures contain no fabricated countdown or archive data. Cel geometry curls physically; two separate semantic corner controls lift their sheets on touch or keyboard without opening the archive preview. Rounded eraser geometry and pencil shafts provide actual shallow depth.

The implemented orthographic worktable is a shallow XY arrangement viewed from `(0, 2, 24)` with a desktop vertical half-span of `max(6.8, 9.75 × height / width)`. This retains a minimum 19.5-unit horizontal field at narrow desktop/tablet aspect ratios, so the outer archive sheets and pencils remain inside the canvas. Phone framing uses a 7.4-unit horizontal field; its vertical span follows viewport aspect. The clock cel is scaled to 51% and its projected DOM width is explicitly scaled to match, preserving all four units at narrow widths rather than clipping them. Softer shadows and stronger registration strokes preserve a handmade surface without a camera tour.

The working runner uses authored graphite anatomy at roughly one world-unit scale, with darker stopped pose ghosts along the path so the trajectory is visible at rest. A bounded closed drawn path lets each successful reset move the finish forward without allocating more geometry. Cursor marks last no more than 700 ms. Corner lifts preserve preview positions and offer a dedicated touch/keyboard target.

Desktop and 375 px comparison captures were reviewed during implementation. Root is completing the 320 px, shared-state and fallback checks; these notes describe the authored scene choices rather than asserting unperformed device measurements.

## Final typography consistency

The implemented font pair is **Barlow Condensed + Caveat**. Barlow Condensed gives the graphite-textured live clock and small archive/header/menu/status/footer labels one legible condensed face. Caveat supplies the hand-lettered title, eraser action, drawn tally, archive continuation and hidden line. Caveat is self-hosted as a variable font with its OFL license under `countdowns/assets/concepts/still-drawing-tomorrow/`; remove platform-dependent Bradley Hand/Segoe Print, Impact and Georgia from selected UI styling. The authored graphite texture remains clipped inside the real live glyphs.

This pass changes font selection only. Existing camera framing, projected widths, hit targets, geometry, shared values and motion remain unchanged; root rechecks the final 320 px composition.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the corrected desktop, 390 px and 320 px captures against this spec. The broad connected clock cel, translucent preview sheets, registration marks, drawn poses and red eraser read as one animator's table. Both phone widths retain all four digits and a full first sheet. The final 320 px tally now clears the eraser's red end instead of tucking its first digit underneath. The supplied archive continuation captures retain layered cels, edge registration marks and ordinary show tabs below the hero.

**Code-reviewed feel:** Twelve authored pose textures and a bounded drawn path establish discrete runner timing, while separate corner controls lift sheet geometry without activating the preview. Confirmation erases/reveals the finish sequence; preview state freezes it. Pointer strokes expire within a capped trail rather than promising an editable drawing. Reduced motion omits that trail and holds the runner; the supplied crown capture reveals a local note on the lifted sheet. These are source and static-state observations, not full-motion or physical-device performance measurements.

**Fidelity decision:** Accept the less cluttered worktable and stable Barlow Condensed/Caveat pair over the reference's incidental margin jokes and platform-dependent handwriting. Keep the clock's graphite treatment clipped inside genuine live glyphs. Actual archived screens remain faithful. No remaining P0/P1/P2 visual defect was identified in the corrected compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.

## Follow-up implementation corrections

**Code-reviewed:** Desktop/tablet camera span now follows aspect ratio, retaining both outer sheets at 700 × 730 as well as the spacious desktop composition. The secret/status selectors target the real DOM classes; theme styling no longer supplies competing secret placement, leaving the shared viewport-bounded placement intact. A successful 3D scene hides the fallback crown image, so only the drawn crown appears during discovery; the fallback image remains available without WebGL. Font provenance paths now include the repository’s `countdowns/` prefix. The spec explicitly describes fixed registration cels and shared reels rather than an unimplemented 300 ms ghost-digit effect.

These corrections passed source checks. Their updated tablet/fallback/discovery compositions remain for the root’s browser review; earlier observed visual acceptance refers to the preceding captures.
