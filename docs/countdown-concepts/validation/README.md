# Reproducible offline checks

From the repository root, with Node 22.13 or newer:

```sh
node docs/countdown-concepts/validation/run.mjs
```

No dependencies, site build, server or network are required. The command records timestamps, source SHA-256 hashes, counts and limitations in [latest-results.json](latest-results.json). It checks saved ES-module syntax before running three separate fixtures:

- `controllers.mjs` imports all seven real controllers and parses their actual desktop/phone GLB geometry. It reads the thirteen work anchors and five archive destinations from generated `countdowns/index.html`, then exercises native focus, preview approach/activation, captured pose restoration, cancellation and Clock return.
- `shared-runtime.mjs` executes the actual saved wrapper/pointer/disposal source, real vendored Three resource objects and real reel/UV helpers. It covers rebuild races, late disposal, shared bitmap ownership, light/reflection resources, queued/reduced reels and abandoned gesture suppression.
- `host-lifecycle.mjs` executes the full saved host with injected dependency imports. It injects first/later render-hook faults plus throwing cleanup; tests desktop/phone reconstruction, preview deferral, canonical native timeline, model/camera profile races and pagehide during loading.

These fixtures mock DOM, drawing, image decoding and the GPU; GLB texture references are removed only in the in-memory test copy. They do not prove shader compilation, material appearance, native browser links, physical touch, actual context loss or frame rate. The [browser evidence](../architecture/evidence/rebuilt/README.md) and [remaining QA gates](../reimplementation-qa.md) are separate.

The recorded October 2 local / October 3 UTC rerun is dated `2026-10-03T03:30:28.550Z`. It passed ten parses, fourteen controller profiles, 182 preview activations, 98 extra-link focus callbacks, seven shared scenario groups and five whole-host lifecycle cases. No module changed during this run; the exact tested hashes are in the result snapshot. Rerunning the command evaluates the newly saved source and replaces that snapshot.
