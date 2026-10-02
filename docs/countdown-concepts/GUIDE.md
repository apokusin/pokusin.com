# Countdown concept implementation guide

Prepared October 2, 2026. All eight directions have been implemented separately for comparison. No final replacement theme is selected yet. Values for lighting, motion and render budgets are proposed starting targets, to tune against the selected reference on actual devices.

## How to use this package

Read this guide, the concept's complete spec, and its reference image before editing site code. Open the image itself; do not infer its appearance from its filename. Use the same eleven headings in every spec to compare decisions across concepts.

The user's instructions take priority. This guide owns functional requirements; the selected spec owns art direction and interactions; the image owns the composition, silhouettes and material relationships. Generation prompts record how the visual was explored. Do not combine concepts or substitute a familiar gallery layout without the user's direction.

The JPGs retain the generated composition at its native size. They are reference art, not page backgrounds with working UI painted into them. Generated images can contain invented thumbnail details, inaccurate timer characters, incidental slogans, or extra ornaments. Those are not permission to change archive content or add copy.

## Fixed product behavior

- Keep the home link, a real countdown, one clear **Again** action, a small press count, and discoverable archive work. Most labels should be limited to names and D/H/M/S. Do not add instruction paragraphs, card descriptions, decorative slogans, tooltips explaining every joke, or dashboard controls.
- Reuse `/api/countdown` and the existing D1 architecture. A successful press sets a deadline one calendar month ahead and increments the shared count. Preview and live rows remain separate. Decorative interactions never mutate this state.
- Pending requests may compress the button or show a subtle waiting cue, but cannot invent a new deadline, increment the tally, or run a success spectacle. A 429 or error leaves the shared state intact and shows the existing short retry/status message in reserved space.
- Visitors learn about other presses through the existing synchronization. Play a smaller material response for a newly observed shared count; do not replay the whole local press ceremony or claim that other avatars are live visitors.
- Keep the existing archive preview: readable scale/fade overlay, Escape/backdrop/close button, focus restoration, and modifier/middle-click opening the real page. Archived pages themselves remain faithful.
- Include exactly one deliberate hidden crown detail that reveals **Long may I count.** Core navigation and reset cannot require finding it. Focus/touch must offer an equivalent discovery to pointer interaction.

## Timer and type contract

Use the existing wall-time/server-offset calculation. Stop at zero and restart on a later future deadline. Keep immediate accessible values even during decorative motion.

Use `countdowns/reels.js` as the numerical source. Normal ticks roll changed digits for 420 ms, with its existing small column delays. Successful reset spins use 1080 ms with 45 ms between columns, approximately 1.4 s through the last of eight digits. Queue normal ticks during the spin, then land on the current real value. Physical material choreography can take longer, as specified per concept. Keep reduced-motion values immediate.

Use at most two UI fonts. The current real timer must remain easy to read while the artwork moves. A texture-based clock may mirror the same reel model, with a single accessible DOM representation; do not maintain an independent simulated time. Never use the mock's baked-in digits, tally, dates, or inaccurate screenshots as live content.

## Scene and asset boundaries

Continue the hand-written static site and vendored Three.js modules. No new package manifest, frontend framework, build system, multiplayer service, physics server, or counter backend is needed for an exploration. Choose procedural geometry for deliberately simple shapes; obtain proper models/textures or generated art layers where the selected silhouette depends on sculpted detail. A wax canyon should not become a few cylinders with a wax color. The low-poly world deliberately permits sphere-based geometry.

Use one main WebGL canvas for the material world and semantic DOM for links, reset, status, timer accessibility and preview overlay. Place real archive preview anchors at scene exhibits. A lightweight projection layer may align their DOM surfaces with moving exhibit frames; cap decorative tilt so previews stay readable, suspend movement on keyboard focus, and keep DOM order meaningful. Closed exhibits can use faithful archive captures, while opening still loads the real archived page.

Generated work previews are composition placeholders. Take actual content from `SHOWS` and preserved archive pages. Preserve the exact season/version titles, link destinations and LIVE conventions. Do not recolor or redraw archived websites to fit a theme.

## Lighting and effects discipline

The per-concept light recipes specify direction, temperature and relative key/fill/rim strengths. Treat those ratios as an art target, not measured radiometry. Tune exposure against reference whites and blacks before adding effects. Preserve the chosen shadow character and silhouette at rest.

Ambient occlusion should establish contact and creases, not dirty every surface. Prefer authored/baked occlusion or inexpensive contact shading. Add a screen-space AO pass only if its visible improvement survives phone profiling. One shadow-casting light is the default. Start at 2048 desktop / 1024 phone shadow resolution; use tighter bounds before increasing resolution.

Bloom is permitted only where the spec asks for a luminous source. No default bloom, chromatic aberration, vignette, rainbow reflection, lens blur, confetti, or cursor particle fountain. Give each effect a cause, a maximum amplitude, and an end condition. Repeated resets reuse bounded geometry and stroke buffers; extending a road, branch, or drawn loop is a temporary visual gag, not unlimited world growth. Cursor decoration must never replace the normal pointer, delay clicking, obscure labels, or cover a preview.

## Motion and responsive behavior

Movement should inherit the material: viscous wax, broad water waves, delayed plant flex, discrete drawn poses, heavy metal, or a light character's walk. Do not reuse one spring preset everywhere. Entry should present a finished resting composition; avoid long loading choreography or mandatory introductory tours.

Keep core actions available through keyboard and touch. For art scenes, native scroll follows a clear sequence of work. In the third-person world, traversal controls are optional shortcuts to a spatial archive; provide direct exhibit navigation and preserve ordinary scrolling outside the canvas. Do not require pointer lock, precise jumping, collision puzzles or game skill.

At 390 px and 320 px, prioritize legible time, a 44 px minimum action target and readable work before scenery. Recompose rather than shrinking a desktop screenshot. Reduced motion removes camera travel, trails, spinning and ongoing deformation while retaining the selected art language, immediate state updates and all previews. A failed WebGL context/import shows an illustrated composition with functioning DOM controls and archive links; never a blank screen or stuck button.

## Performance targets and acceptance

Proposed targets: 60 fps on a typical desktop and 30 fps on a phone while interacting. Start with DPR capped at 1.5; lower device quality before changing the selected silhouette. Per-concept geometry/draw-call figures are ceilings to profile, not guarantees. Reuse materials, instance repeated props and bound particle lifetimes. Pause rendering when hidden/offscreen; render only during motion/interaction or at a reduced cadence for intentional ambient effects. Dispose textures, geometry and listeners when switching themes.

Before handoff, compare the rendered page and selected reference side by side at the same viewport/state. Inspect desktop, 390 px and 320 px compositions; readable previews; real reset/tally; failed/pending/rate-limited requests; another visitor's reset; expiration/restart; preview close/focus restoration; keyboard/touch; reduced motion; blocked WebGL; and actual motion frames. Verify that changing dates/counts remain real. Fix fidelity, overflow and core-interaction issues before adding secondary spectacle.
