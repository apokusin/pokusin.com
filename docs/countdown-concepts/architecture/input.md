# Input and navigation ownership

**Planned, not implemented.** A full-viewport canvas must still have a understandable route through work. Material interaction, navigation, opening a preview and resetting the clock are distinct intents. Do not leave those decisions to the next agent or hide them behind a paragraph of instructions.

## One native scroll runway where required

These seven installations use an ordinary vertical document scroll position to select authored views; they do not intercept every wheel event or build inertial scrolling. The healthy canvas is fixed to the viewport. One noninteractive, aria-hidden runway supplies actual document height. Its height derives from authored stops (about one viewport per reading interval, tuned against the actual scene), not from leftover HTML shelves. The semantic twin is visually clipped and contributes no extra layout height. A runway is an invisible input surface, not another web gallery.

Map scroll position to a bounded path parameter, then evaluate a concept-owned camera/scene pose. One view can span an interval so work stays still long enough to read. A source-faithful opening composition is at the start. Stop interpolation on focus/hover where needed; do not turn scrolling into an automatic tour. Camera path positions, item IDs, selection/layer state and native scroll offset form one pose snapshot. Programmatic focus/direct selection synchronizes the runway without a competing smooth-scroll loop. Reduced motion uses immediate resting poses.

At the end the route stops; another ordinary scroll cannot grow assets or restart the artwork. On loading/failure, remove the runway and fixed canvas/clipping and restore native document flow. If a native modal is already open, retain it and restore a visible native origin on close. Scene promotion restores selected item/path deliberately; loading must not cause a scroll-anchor jump.

Canvas touch-action permits pan-y. Vertical one-finger movement always remains browser scrolling and may cancel a candidate object gesture. No pointer lock, jump requirement, two-finger-only route, compulsory orbit, wheel hijack or forced onboarding.

## Committed gesture model

| Concept | Route through work | Decorative/manipulation gesture | Ordinary action and distinct feedback |
| --- | --- | --- | --- |
| Roadworks | Native scroll follows the supported road, with seven station reading stops | Pointer on empty dusty ground leaves a short track. Tap/lift the visibly turned roll/ribbon lip for the crown; optional horizontal pull stays local. Vertical touch always scrolls | Billboard face opens its real work; version lip fans neighbors; orange cap depresses before real reset |
| Gum | Native scroll pans between four unequal hanging clusters | Horizontal pull on exposed empty gum after 6px intent; vertical movement keeps scroll. A visible stretched lip lifts on approach | Photograph center opens immediately; separate lip lifts/fans prints. Joined Again pad compresses; bubble never acts as another reset |
| Wax | Native scroll moves along the open channel to terraced recesses | Pointer proximity bends the flame; optional touch flame response is bounded and never captures scroll | Recess face opens; shallow Again pool receives pressure; crown remains a separate crease clue |
| Tide | Native scroll follows the diagonal shore from one exposure to the next | Pointer traces a local wake only on water; touch water taps emit one ripple without consuming vertical scroll | Photograph center opens; dry paper lip exposes versions; shell action depresses rather than initiating a camera drag |
| Fruit | Native scroll follows the gnarled branch between forks | Tap/focus visibly cupped leaf to roll it open; no free grab of photographs or whole-branch dragging | Tag center opens; neighbor version edge is exposed. Split fruit is the sole reset; branch flex stays secondary |
| Drawing | Native scroll moves through authored worktable reading positions. Desktop horizontal empty-table drag is an optional bounded shortcut tied to the same path | Drag/tap a visibly rolled cel lip to lift/fan; never start lifting from the photograph center | Image center opens in one activation; protruding named folio tab selects its group. Worn eraser is distinct from free drawing paper |
| Metal | Native scroll moves between unequal suspended bays; physical index notches select the same stops | Pointer/touch movement only within the visible floor filings patch combs filings; no free orbit or global screen drag | Plate face opens, a visible folded lip exposes versions, counterweight cap presses axially along its own axis |

Each concept's primary source forms remain different. The shared runway is merely an input adapter; it does not prescribe framing, equal stations, panel rows or transitions. Metal travels along an installation; Drawing shifts over a table; Tide follows an actual shore. Do not animate every camera with a generic spring or make seven identical sideways carousels.

Gesture state begins with a candidate hit and records start position. A preview/reset candidate triggers on release only below the movement threshold. Horizontal material dragging requires direction dominance and begins only on its explicit material region; it cannot claim a version/image action. Pan-y cancellation, pointercancel, lost capture, blur, hiding, modal opening and context loss terminate every candidate/capture. No release after cancellation can fire Again or open a preview.

## Visible routes without explanatory copy

Keep the existing small **Artur Pokusin/Home** and **Worlds** utility destinations reachable at every view. They may be sparse native corner links or an equally legible physical/native pairing. Do not conceal them under an easter egg or require visitors to learn a special gesture.

A small **Clock** return appears whenever the view has left the opening timer/action composition. It is one necessary label, styled as a paper/engraved utility appropriate to the concept, not a toolbar or status dashboard. It returns to the exact opening camera/selection/scroll pose and is available to pointer, touch and keyboard. Hide it again only when the full live clock and Again are visibly available. The other decorative crown never doubles as this route.

Within the scene, the next object/path remains partly visible or physically connected beyond the current crop: continuing road, taut tether, wax channel, diagonal shore, branch, protruding folio tab or steel index. Hover/focus produces a small **material-specific** response at an actionable face; exposed edges/version labels make variation selectable. These cues, plus native scrolling and the return link, make navigation evident without instructions or invented slogans.

The always-available native focus route contains Clock and the seven actual show groups, then their exact version actions. It can appear as a compact focus-only drawer, but pointer visitors also have real scene paths/objects. A hidden semantic route alone does not make a canvas navigable. Selecting a group frames its useful reading stop and exposes the requested actual version; no permanent rectangular menu overlays the artwork.

## Links, focus and preview

Every preview surface has its exact source href and a native semantic anchor. Hover/press must offer verified native modifier/middle-click and context-menu behavior, with plane-aware bounds where a temporary hit overlay is used. Occluded image centers cannot remain clickable through another solid. Focus brings a hidden/partly obscured target to a stable readable pose and maintains a visible indicator on it; screen readers retain exact show/version names.

One ordinary activation of a visible image approaches and opens its real archive in the existing readable modal automatically. Lifting a separate physical lip can reveal other versions, but cannot make every preview a mandatory lift-then-open puzzle. Capture scroll/camera/articulation/layer/selection state before approach; freeze the scene during the modal and restore exactly on close. Escape during approach cancels it; stale callbacks must never reopen after close.

Do not confuse reveal and activation: focus can frame/open a fold so a target is visible, while Enter activates the genuine anchor. Restoring focus after closing must not re-run an approach or change the restored pose. Readable real controls/status prevail if graphics are lost.

## Input acceptance before expansion

Demonstrate mouse click versus drag, vertical touch scroll versus material gesture, keyboard focus-visible equivalents, direct group selection, Clock/Home/Worlds from a distant view, modified/middle/context links, and preview restoration. Test a cancel/blur/modal interruption at mid-gesture and opening/closing during a resize. Check at 390/320; phone emulation does not prove physical-device touch performance. No implementation is certified by this plan.
