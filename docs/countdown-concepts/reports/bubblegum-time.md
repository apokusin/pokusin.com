# Revised material direction — Bubblegum Time

> **Current status — rejected; architecture redesign is not implemented.** On 2 October 2026 the user rejected this render as failing to resemble the original concept. Every prior visual acceptance, including the later material review, is withdrawn. The observations and screenshots below are historical evidence of the failed implementation, not current approval. Functional checks remain evidence of the behavior they tested; they do not establish art fidelity. The replacement [eleven-section spec](../specs/bubblegum-time.md) and [architecture audit](../architecture/sculptures.md) govern the next execution. No authored replacement scene/assets have yet been delivered.

## Historical renewed independent review — October 2, 2026

**Historical review claimed visual acceptance; that acceptance is withdrawn.** An independent art-director subagent inspected the actual reference, fresh desktop pair and both phone widths. No unresolved P0/P1/P2 visual defect remained in that evidence.

All four genuine values now sit inside cream physical drum apertures. Glossy stretched gum, cotton photographs and satin pins remain distinct. The fourth face initially escaped behind the balloon; moving the balloon/neck behind that aperture fixed the P1 in fresh renders.

**Accepted source limitation:** The broad folds and paper curls are simpler and less viscous than the generated reference. Isolated cord-like fold ridges are an optional refinement. This is the documented rendered interpretation, not a claim of photographic source equivalence.

Evidence: [reference/current](../qa/bubblegum-time-material-comparison.jpg), [1280 × 900](../qa/bubblegum-time-material-desktop.jpg), [390 × 844](../qa/bubblegum-time-material-mobile.jpg), [320 × 720](../qa/bubblegum-time-material-320.jpg). Root separately verified real phone resets 386 → 393 across all seven, genuine archive preview/Escape/focus restoration, 44 px or larger targets, no document overflow, reduced-motion crown discovery and actual graphics-loss restoration. [Shared runtime QA](../../../design-qa.md) distinguishes native checks from still-image review; no hardware FPS or physical touch-device result is implied.

The implementation-stage observations below record the development and correction of these surfaces; earlier pending/historical acceptance is superseded by this final review.

The user rejected the earlier scenes as prototype-level compared with their references. The previous acceptance below is historical and does not certify this revision. Fresh browser acceptance is pending.

The actual reference and earlier desktop render were reviewed side by side before this implementation. The earlier belt read as a beveled plank and the balloon as a uniformly glossy sphere. The revision must demonstrate pulled membrane folds, gathered joins, shaped studio reflections, thin pink volume, satin pins and tactile paper. Its authored asymmetry and quiet mint space are already valuable; material richness must strengthen those, not add more labels.

Read the revised eleven-section spec for the exact recipe. Source checks and root browser captures will be recorded separately; no frame-rate or physical-device claim is made before measurement.

## Material implementation in this revision

The connected belt is adaptively tessellated, then sculpted and smoothed across coincident vertices. Gathered folds are unequal and restrained, concentrated at aperture shoulders, pin roots and the balloon neck. Precomputed normal groups keep the moving gloss attached to geometry without rebuilding lookup maps per frame. A shaped PMREM studio environment supplies front-left and overhead white softboxes with dark gaps and a rose bounce. Pink membrane/balloon use physical clearcoat, low transmission and bounded thickness, while the mint receiving shadow is deliberately limited to 16% density. The final drums are actual recessed enamel cylinders with satin rim rings and narrow centre seams. The genuine DOM glyphs project onto rigid drum-centre anchors; healthy graphics remove the earlier independently positioned gradient tiles, and graphics loss restores their illustrated fallback.

Hero prints have curved physical cotton-paper surfaces beneath the genuine flat image/caption controls; their corner curl has actual depth and casts a shadow. Continued archive prints use matching fibre stock, larger uneven gum slings, mixed paper sizes and longer quiet gaps. A conventional repeated heading row is replaced by a small attached paper identifier.

Source validation: module syntax passed. First desktop pass showed overly hard, dark shadow wedges and regular raised folds; the second pass reduces shadow density, reduces/reorders the fold relief and removes planar triangle facets. Root browser review remains required for the revised desktop, 390 px and 320 px compositions, motion and controls. A later fresh capture revealed seconds occlusion: the balloon front and the initial neck crossed the fourth cavity while the real glyph remained visible above them. The targeted correction moves the balloon behind every drum, including at peak breath, and moves the neck outside the aperture reading zone. Fresh browser confirmation of all four faces remains required.

---

# Art direction review — Bubblegum Time

Reviewed the actual [reference image](../references/bubblegum-time.jpg), complete [spec](../specs/bubblegum-time.md), and shared guide. The initial sections below are recommendations for implementation; the later implementation addendum and final acceptance distinguish source review from observed working-page visuals.

## The compelling idea

This has the most immediately comic silhouette of the four material worlds: an enormous bubble holds a disproportionately serious mechanical clock. The mint negative space and black title make the sugar feel editorial rather than childish. Metal pins, curled prints and long reflected highlights supply the tactile credibility. Preserve those material contrasts; a uniformly glossy pink blob would lose the joke.

## What needs to become intuitive

“Peelable” can wrongly suggest that visitors must drag a print to open it. A curled corner should lift on approach, but the whole flat photograph must remain a normal link. A brief paper shadow change establishes clickability before any stretch. The larger upper-right balloon is inviting; its bounded dimple should acknowledge touch without implying it is a second reset button.

The large diagonal title must yield to the timer and first archive print at 320 px. The bubble can crop; digits and interactive paper cannot. Avoid continuously moving every tether: visitors need a still place to read the actual archive work.

## Exact feel and state direction

- Empty gum may stretch on a deliberate drag by at most 32 px desktop / 20 px phone. A 6 px intent threshold separates this from clicking; vertical phone swipes retain native scroll. A simple tap produces one dimple, never captures a page gesture.
- Gum approaches the pointer slowly, then returns with one small overshoot. Paper corners respond promptly. This difference makes the material soft while links feel reliable. Stop local deformation when a print gains keyboard focus.
- Pending Again depresses at most 3% and holds; the bubble does not inflate. On confirmed success, balloon expansion begins at 80 ms, peaks at 650 ms at 12%, and relaxes to rest by 1800 ms. A tightening front travels from the button through four drum bridges while the existing reset reels settle. Neither digits nor paper contents deform.
- Repeated successful resets retarget the existing deformation from its current value and never compound scale or spawn more strands. A newer remote press makes a 2% bubble breath over 450 ms; it does not impersonate a local press. Rejection releases the button over 160 ms and uses the reserved status area.

## Discovery and the one easter egg

Put the single crown on the underside of one curl near the clock, with only a tiny metal edge visible at rest. Approaching that curl or focusing its real 44 px button lifts the fold to expose it. Activation reveals “Long may I count.” in that paper underside, then leaves it open until dismissal or focus departure. This is a discovered object, not an invisible pixel hunt or another gum control.

## Assets and execution risk

The connected ribbon needs a shaped mesh or carefully authored layered contour, including the four apertures and stretched pin joins. Reflection should use a neutral studio strip map, not rainbow environment lighting. Obtain art-only paper corner layers/normal detail and a balloon silhouette; all archive content and live digits remain separate DOM. Do not use the reference image as a flat clickable background.

## Must preserve and prove

Keep the connected diagonal strip, cropped balloon, pale drums, mint silence and exaggerated black type. At rest, the first photograph must be selectable without discovering a gesture. Test pending, rejection, repeated success, remote update, focus, touch scroll, reduced motion and preview closure. The success should feel like one breath travelling through one material, not four unrelated animations.

## Implementation addendum

The implementation is a connected, scalloped extruded gum belt, a volumetric balloon, thin tethers and pins, and real DOM reel drums. A procedural neutral studio reflection supplies long gloss bands; billowed depth and inset drum-side shading replace the initial flat plank/tiles. No complete reference image is used at runtime. Resting deformation sleeps until approach or reset; a 6 px deliberate drag threshold protects ordinary taps and native vertical phone scroll. Confirmed expansion peaks at 650 ms and returns by 1800 ms; repeated responses reuse the same vertices.

Desktop uses an orthographic material stage (half-span 5.5) to align independently readable DOM. At 390/320 px the belt scales and the four drums remain a single line. The two lower phone prints are separated at 55% and 72% of the hero rather than overlapping their labels. Crown projection follows its one real mesh and replaces the fallback crown icon. The actual face pair is Georgia/Arial. The first scene pass exposed an infinite-age/NaN deformation bug and inherited absolute reset positioning; both were fixed and initial, reset and reduced/mobile vertex states were checked as finite. Browser fidelity and performance remain acceptance checks, not measured claims here.

A subsequent source review corrected two interaction details: deformed belt vertices now recompute their normals, keeping the studio gloss attached to the moving surface, and even-numbered phone archive prints use the same small lift for keyboard focus as for hover instead of inheriting a desktop vertical stagger. The orthographic camera is the implementation contract; the 35 mm perspective belongs only to the visual reference.

## Historical independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the final desktop, 390 px and 320 px captures against this spec. The connected scalloped belt, pale drums, cropped balloon and diagonal black lettering retain separate material roles. At both phone widths the decorative title yields to a complete four-unit clock, a fully visible first print and a distinct Again/tally pair. Paper captions remain outside the elastic surface; the balloon can crop without making an action ambiguous. The supplied archive continuation captures retain mint space, a loose tether and irregular paper mounts below the hero.

**Code-reviewed feel:** The module separates deliberate gum dragging from ordinary taps, declines vertical touch dragging, and keeps deformation out of live DOM glyphs. Focus freezes secondary movement; the one curl has a semantic focus/tap path. Local confirmation and remote update drive differently sized bounded breaths. These are source observations, not a claim that a still image proves gesture timing or a measured frame rate.

**Fidelity decision:** Retain the authored belt contour and studio gloss rather than pursuing the reference's exact incidental droplet placement. Faithful archive captures replace invented reference screens. No remaining P0/P1/P2 visual defect was identified in the supplied final compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.
