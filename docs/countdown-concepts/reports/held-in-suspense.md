# Art direction review — Held in Suspense

Reviewed the [actual image](../references/held-in-suspense.jpg), [spec](../specs/held-in-suspense.md), and shared guide. This is a pre-implementation review; the recommendations below have been incorporated into the spec.

## Creative judgment

The sculpture has the confidence of a gallery installation. Its wit is quiet: an absurd amount of engineered balance supports the very ordinary act of waiting. The counterweight is visually heavy, the clock plates feel hung rather than framed, and the archive shares their physical support. This is a promising counterpoint to the playful paper and road directions.

The rendering needs discipline. Cheap mirror chrome, rainbow environment gradients or floating panels would turn a poised installation into a technology demo. The brushed faces, dark stone contact and long window reflections are more important than exaggerated shine. The room must feel bright without bleaching cables and pivots away.

## Visual strengths to protect

- The left stone anchor and rising zigzag define a strong asymmetric silhouette.
- Cables make the timer and archive displays physically dependent on one structure.
- The tall black numerals are readable against brushed steel.
- The cylindrical Again endcap is an unusual but coherent action object.
- Iron filings add a responsive material at ground level without stealing the stage.

The empty white space is active composition, not a gap to fill with copy or controls.

## Friction and invisible-feel risks

A suspended cylinder can read as sculpture rather than a button. Keep Again frontal, preserve a stable semantic hit region, and let hover/focus produce a tiny axial pressure movement. Its action should not require a moving 3D target. The endcap must never rotate away while a visitor attempts to press it.

An invisible spring simulation might look randomly wobbly rather than heavy. The motion must travel through a visible connection: cap pressure, cable tension, pivot transfer, plate correction, then a slow settle. Separate the large counterweight movement from the very small timer movement so reading remains effortless.

Filings that follow the pointer everywhere could contaminate the pristine floor and obscure controls. Restrict their field to the authored lower-right patch. Phone framing moves a reduced filing sample onto a small frontal tray connected to the left support. Fingers comb only that visible patch; ordinary scrolling and preview activation take priority. Bays reached by scrolling need supported frames at coherent heights rather than disconnected copies of the hero.

## Feel decisions incorporated

The endcap travels axially by 0.04 scene units over 110 ms on hover/focus and another 0.04 while pressed. Request pressure holds the cap without swinging the structure. On success, the cable tightens for 120 ms, the weight rises over 700 ms, a 400 ms wave passes through the authored pivot chain, and the structure settles over two seconds. Real reel motion starts immediately at confirmation. Motion is deterministic and damped; it does not accumulate energy with repeated clicks.

Clock plates never exceed one degree, archive plates three degrees. Archive targets freeze while pointed at or focused. Remote updates cause only a half-degree pivot correction; error releases pressure without a wave. Closing a preview restores the same bay, scroll and focus. A tiny engraved crown under one pivot gets a small grazing-light glint on approach, with an equivalent keyboard/touch target; it alone reveals the hidden line.

Use a capped field of filings with 100 ms magnetic response and approximately 600 ms characteristic relaxation toward rest after the pointer leaves. Maintain visible empty ground around the patch. A focused plate keeps a clear material outline and a stable target instead of generating particles. The index is a restrained vertical rail of real show names with a short active dash, never an unnamed set of ambiguous tick marks.

## Asset and implementation direction

The essential authored assets are connected beveled beams, pivot bolts, cable attachment points, a heavy cylinder and irregular stone base. A small custom studio environment with elongated pale rectangles will achieve the right material more economically than realtime reflections. Brushed directional normals should stay subtle at readable scale. Use faithful archive captures on supported plates and semantic DOM for live numerals and links. Reduce filings before reducing cable/pivot readability.

## Art acceptance gates

At rest, the structure appears held under weight. At success, a viewer can trace the force from Again through the visible cable and pivot chain. The plate surfaces remain readable through the entire settle. A phone still shows one connected sculpture, and reset does not cause a camera move. No uncontrolled physics, generic metallic spheres, bloom, mirror glitches or dashboard chrome enter the final art direction. Reduced motion retains the asymmetry and materials with all direct actions intact.

## Implemented art pass

The working sculpture uses beveled extruded rails, flush pivot bolts, cables attached at the actual rail heights, varied archive elevations, and an irregular subdivided slate plinth. An authored monochrome rectangular studio environment is prefiltered once; a restrained directional brush/reflection profile strengthens the steel surface. The desktop floor patch uses at most 2200 pooled instances. Phone framing presents 180 of the same instances on a small frontal steel tray connected to the left support; there are no physics bodies or allocations per press.

The implemented desktop view targets `(0, 2, 0)` from `(0, 7.8, 24)` with an orthographic vertical half-span of `max(5.85, 8.4 × stage height / stage width)`, retaining upright architectural relationships and enough downward view to read the ground filings. Its minimum 16.8-unit horizontal field includes the stone plinth, both outer archive mounts and the full endcap at narrow desktop/tablet aspect ratios; wide screens retain the original 5.85-unit baseline. Phone framing uses a seven-unit horizontal field and one connected vertical support system, with timer plates in two pairs and supported archive plates below. The small wordmark stays in the clear header margin, avoiding bolts and the theme selector.

Live clock units are individually projected onto their real suspended plates; the reset and tally follow the real counterweight endcap. Re-pin world widths when scale changes on mobile. All studio textures are authored locally in the module, not external HDR downloads. The archive continues as cable-supported cantilever bays with a restrained named show index.

Desktop and 375 px comparison captures were reviewed during implementation. Root is completing the 320 px, shared-state and fallback checks; these notes describe the authored scene choices rather than asserting unperformed device measurements.

## Final typography consistency

The implemented font pair is **Barlow Condensed + Libre Baskerville**, matching the intended exhibition lettering. Barlow Condensed owns live digits, title, show rail, tally, labels and header/menu/status/footer UI. Libre Baskerville owns Again, sparse archive links and the hidden line. All existing projected widths and positions remain fixed; type changes never create a second timer model or alter reel timing.

This pass changes font selection only. Existing camera framing, projected widths, hit targets, geometry, shared values and motion remain unchanged; root rechecks the final 320 px composition.

## Final independent art acceptance — 2026-10-02

**Observed desktop and phone visuals:** Reviewed the corrected desktop, 390 px and 320 px captures against this spec. Connected beams, flush pivots, visibly suspended plates, slate anchor and cylindrical action retain the asymmetric sculpture. The phone reassembly still reads as one connected support, with two complete clock pairs and a frontal endcap. The final 320 px tally now has clear separation beneath Again. The supplied reduced-motion crown capture also keeps the hidden phrase above the endcap instead of obscuring its label. Archive continuation captures preserve supported bays and a named show rail.

**Code-reviewed feel:** Pressure moves the cap along its axis; confirmation raises the existing weight and transfers bounded correction through connected plates. Focused/hovered archive faces suppress their swing. The filing patch uses pooled instances and an authored boundary rather than a free-ranging particle system; reduced motion holds the balance. Those source choices support deterministic material behavior, but this review does not infer full force-transfer timing or frame-rate measurements from still captures.

**Fidelity decision:** Accept the restrained rectangular studio reflections and simpler brushed plate profile; they keep numbers legible while avoiding mirror chrome. Preserve tallies and phrase placement independently when refining the endcap. Actual archive screenshots intentionally replace the reference's invented imagery. No remaining P0/P1/P2 visual defect was identified in the corrected compositions; runtime state, input and failure acceptance is recorded separately in the shared QA report.

## Follow-up implementation corrections

**Code-reviewed:** Camera direction is now consistently orthographic in the spec. Phone framing adds a visible brushed-steel filing sample tray on the left support beside the counterweight. Its 180 pooled strokes respond only to contact begun inside the patch, hold a short tap for 280 ms, and rotate through the shortest angular path. No pointer capture or default prevention is used; native scroll cancellation releases the field immediately. Desktop retains the authored ground patch. Reduced motion retains the still material sample.

Actual `clock-status` and `countdown-secret` classes now receive theme styling without competing with the shared bounded secret placement. Successful scene rendering hides the fallback crown image, while no-WebGL retains it. Source checks pass; the new phone tray, touch response and fallback/discovery states still need root browser review. Earlier visual acceptance refers to the supplied preceding captures.

## Tablet framing correction

The supplied 700 px viewport captures exposed horizontal clipping after the shared breakpoint was aligned with CSS. The scene now derives its desktop orthographic span from the actual stage aspect ratio, including scrollbar-reduced width, while keeping the original wide-screen baseline. This is a camera-fit correction only; geometry, type, hit targets and interactions remain unchanged. Source checks pass. Root will recapture the corrected 700 px and large desktop views before visual acceptance.
