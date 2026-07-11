# MotionKit Spatial Rig Architecture

## Purpose

Phase 10 makes the Motion Rig the product-level extension boundary. Orbit Carousel remains the only rig, but shared workspace code no longer owns its slot count, labels, ratios, descriptions, renderer, demo media, inspector exposure, or export requirements.

## Definition Contract

`RigDefinition<Settings>` is declared in `src/rigs/types.ts`. A definition contains:

- stable `id`, `name`, category, descriptions, and version;
- `slotCount` and one `slotLabel` per position;
- supported ratios, default ratio, and fully validated default settings;
- accepted media types, size limit, item range, preferred dimensions, and export requirement;
- ordered inspector section metadata and feature capabilities;
- a renderer receiving frame, progress, settings, slot count, media, selection, and preview-guide state;
- export duration, filename prefix, and transparency metadata;
- preset schema compatibility metadata;
- a rig-owned demo media generator;
- an `isSettings` validator used by session restoration.

## Registry

`src/rigs/registry.ts` is the only registration point. It:

- registers Orbit Carousel;
- resolves rigs by id;
- falls back to Orbit Carousel for missing or invalid ids;
- validates unique ids, slot-label counts, media limits, default ratios, settings, duration metadata, and transparency capabilities during startup.

## Adding A Future Rig

1. Define the rig settings type and settings validator.
2. Implement its renderer without importing workspace components.
3. Add a rig-owned demo generator with exactly `slotCount` results.
4. Create a complete `RigDefinition` with media, inspector, export, capability, preset, and version metadata.
5. Add any intentionally specialized inspector implementation behind the definition’s section and capability contract.
6. Register the definition in the central registry.
7. Verify partial media, full media, reorder, selection, undo, all supported ratios, transport behavior, preview, WebM, PNG, session migration, focus behavior, and responsive layouts.

Do not register placeholder or incomplete rigs. Registration makes a rig a supported product capability.

## Intentionally Orbit-Specific

- orbit geometry and depth ordering;
- card shape drawing and Orbit-specific settings controls;
- the Luma Field four-card demo artwork;
- Orbit Carousel settings ranges and validation;
- Orbit Carousel renderer internals.

Shared UI may render these through the active definition, but must not reproduce their metadata or requirements independently.
