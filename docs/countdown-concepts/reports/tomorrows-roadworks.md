# Art direction review — Tomorrow’s Roadworks

Reviewed the [actual image](../references/tomorrows-roadworks.jpg), [spec](../specs/tomorrows-roadworks.md), and shared guide. This is a pre-implementation review; the recommendations below have been incorporated into the spec.

## Creative judgment

The visual joke succeeds because the road is both a route into the archive and something being manufactured. The rolled strip suspended from the crane is the decisive object: tomorrow is literally more road. The oversized clock and orange button create a confident first read, while the exaggerated civil engineering rewards a closer look. Keep this as an inhabited miniature, with generous material contrast between the blue road and pink mineral landscape.

The danger is reproducing its quantity of props while losing its spatial logic. The screenshot is crowded but has a clear diagonal route. A row of blue tracks behind rectangular cards would borrow its colors and miss the idea. The road must remain visibly connected, the billboards must have supports, and the crane must pull the same strip the visitor can trace with their eyes.

## Visual strengths to protect

- The cropped foreground blue bend makes the scene feel larger than the viewport.
- The massive black clock reads clearly despite the busy terrain.
- Orange machines and safety markings provide small moments of humor through scale rather than copy.
- Unequal billboard heights create an archive route rather than a shelf.
- The hanging asphalt roll makes the reset gag intelligible before anything moves.

The image's incidental slogans, dense plants, invented work art and excessive vehicle inventory are not requirements. Preserve the designed silhouette before adding scenic detail.

## Friction and invisible-feel risks

“Scroll travels along the road” is too vague. Visitors could expect a driving game, a rail camera or ordinary page scrolling. The implementation should retain native vertical scrolling and give the route a clear downward progression; the scene may track scroll modestly, but never capture the wheel or automatically move the visitor after a reset.

Hovering trucks and dragging the roll sound playful but may look identical to archive targets. Restrict decorative dragging to the roll's visible free edge. Billboards and station markers receive a distinct short lamp brightening and stable focus outline. Noninteractive trucks do not pretend to be buttons. Decorative interactions must not block a billboard underneath.

A crane that extends an endless road would imply persistent world growth and eventually break composition. The extension is a bounded construction trick: one visible seam moves, then the strip folds back into the authored route beyond view. The joke remains that progress makes no progress.

## Feel decisions incorporated

On press, the orange cap travels inward immediately over 90 ms and holds under request pressure. A confirmed reset starts the real reel spin and releases the crane catch after a 140 ms beat. The roll unwinds over 1.6 s with a slow beginning, faster middle and heavy settling tail. A single truck moves only after its new segment is visibly stable, then disappears behind a pier. This ordering makes the button causally connected to the material instead of merely triggering simultaneous animations.

Station hover/focus brightens its lamp over 120 ms and lifts the physical marker by at most 3 px. Its preview hit region stays still. The billboard freezes decorative movement while focused or pointed at. Station activation centers through native smooth scrolling; reduced motion centers immediately. Return from preview restores the same scroll position and focus.

The cursor track is a small optional ground effect, confined to free terrain and disabled over UI, touch and reduced motion. It should disappear by 700 ms and never resemble a road-drawing tool. The roll exposes a tiny crown on its underside when lifted; activating that same detail by keyboard or touch reveals the single secret.

## Asset and implementation direction

Author a connected bevelled road ribbon, road-roll geometry, three recognizable low-detail machine silhouettes, a crane with cables, mineral outcrops and believable billboard mounts. Use aggregate normals and warm contact shading sparingly. Faithful archive images remain rectangular and readable. If scenic complexity must be reduced on phones, remove spare vehicles and terrain clutter before flattening the connected road or shrinking the real clock.

## Art acceptance gates

At rest, a visitor can identify Again, the timer and the first billboard without reading instructions. During success, the crane visibly pulls a strip attached to the route. A pending or failed request does not build anything. The first scroll exposes another supported exhibit rather than an empty landscape. The crown is discoverable without becoming a second reset control. Desktop and phone retain the clock/road/crane silhouette, and reduced motion still feels like a construction diorama.

## Implemented art pass

The working scene adds an original art-only `mineral-coast.jpg` scenery layer: pink mineral coastline, open ground and sky, generated separately from the concept mock. It contains no roads, displays, labels, digits or controls. Real geometry supplies the connected road ribbons with visible thickness, instanced lane marks and guardrail posts, tubes for guardrails, crane/roll, concrete clock/pillar, billboard edge supports and crafted roller. Foreground mineral meshes are displaced and grain-shaded; never substitute the complete concept screenshot as a background.

The implemented desktop comparison uses an orthographic half-span of 5.75 units, target `(0, 2, 0)` and view position `(0, 8.7, 23)`, with the clock enlarged 28% relative to the first prototype. This fills the upper-left composition instead of leaving a blank upper band. Phone framing derives its vertical span from a 7.3-unit horizontal field and recomposes the three supported mounts vertically. Re-register projected DOM widths whenever object scale changes; the projection helper interprets width in world units.

The scenery asset and its generation provenance live under `assets/concepts/tomorrows-roadworks/`. Its CSS also supplies the no-WebGL scenery fallback. The archive continues through unequal roadside billboard stations with native scrolling, supported mounts and restrained safety markers; it is not a generic shelf below a hero.

Desktop and 375 px comparison captures were reviewed during implementation. Root is completing the 320 px, shared-state and fallback checks; these notes describe the authored scene choices rather than asserting unperformed device measurements.

## Final typography consistency

The implemented font pair is **Barlow Condensed + Libre Baskerville**. Barlow Condensed owns the industrial clock, dimensional title, station names, navigation, tally, labels and all header/menu/status/footer UI. Libre Baskerville is reserved for Again and the single hidden line. Generic sans/serif fallbacks are resilience only; do not introduce Impact, Arial, IBM Plex Mono or Cormorant as an additional selected UI face.

This pass changes font selection only. Existing camera framing, projected widths, hit targets, geometry, shared values and motion remain unchanged; root rechecks the final 320 px composition.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the corrected desktop, 390 px and 320 px captures against this spec. The concrete clock, orange pressure cap, connected cobalt route and supported unequal billboards remain identifiable. The independent review initially found the clock hiding the rolled highway; the final views now expose its hanging blue roll and connected strip above the desktop route and between clock/action and first phone billboard. This restores the construction joke instead of relying on a hidden animation. The supplied archive continuation captures maintain roadside mounts and a looping route below the hero.

**Code-reviewed feel:** One authored ribbon deforms during confirmed construction rather than accumulating new road. The delayed truck follows the settled response; pending pressure and remote lamp response have separate state paths. The roll's crown follows the same exposed object, and reduced-motion focus applies its reveal directly. The supplied reduced-motion crown capture places the hidden line near that object, clear of Again and the clock. These checks distinguish visible composition and source mechanisms from an unmeasured animation/device-performance claim.

**Fidelity decision:** Accept the separately generated mineral coast and simpler modeled vehicles; they preserve the scene's scale without baking controls into scenery. Keep the exposed roll zone clear in future camera changes. Faithful archive images replace invented reference exhibits. No remaining P0/P1/P2 visual defect was identified in the corrected compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.
