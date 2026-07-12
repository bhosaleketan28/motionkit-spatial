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
- a collection of compatible, rig-owned preset definitions;
- a rig-owned demo media generator;
- an `isSettings` validator used by session restoration.

## Registry

`src/rigs/registry.ts` is the only registration point. It:

- registers Orbit Carousel;
- resolves rigs by id;
- falls back to Orbit Carousel for missing or invalid ids;
- validates unique ids, slot-label counts, media limits, default ratios, settings, duration metadata, transparency capabilities, and every preset contract during startup.

## Preset Contract

`RigPreset<Settings>` is a versioned patch owned by one rig. A preset declares:

- stable `id`, `rigId`, name, description, and compact preview style;
- a settings schema id and version that must match the rig’s preset compatibility contract;
- `settingsPatch`, containing only values the preset intends to change;
- `ownedProperties`, the exact keys the preset may write.

The rig definition exposes its preset collection. `src/rigs/presetRegistry.ts` derives the visible registry from registered rigs and resolves presets by the compound `rigId:presetId` identity. Shared UI never contains preset names or values.

Application is guarded in `src/rigs/presetSystem.ts`. It rejects incompatible versions, foreign rig ids, undeclared patch keys, missing owned values, unknown properties, and patches that fail the rig settings validator. Valid application copies only owned properties over the current settings. Media, transport state, workspace state, and unowned rig settings remain intact.

The workspace stores the active preset id with the validated settings. “Applied” is derived by comparing current owned values with the preset patch; any later change to an owned value becomes “Modified.” Reapply restores only those owned values. Old sessions migrate with no active preset, and missing or incompatible preset ids are ignored while compatible rig settings are preserved.

## Adding A Future Rig

1. Define the rig settings type and settings validator.
2. Implement its renderer without importing workspace components.
3. Add a rig-owned demo generator with exactly `slotCount` results.
4. Define any presets beside the rig, with unique ids, explicit owned properties, and matching schema/version metadata.
5. Create a complete `RigDefinition` with media, inspector, export, capability, preset, and version metadata.
6. Add any intentionally specialized inspector implementation behind the definition’s section and capability contract.
7. Register the definition in the central registry.
8. Verify preset application and modification, partial media, full media, reorder, selection, undo, all supported ratios, transport behavior, preview, WebM, PNG, session migration, focus behavior, and responsive layouts.

Do not register placeholder or incomplete rigs. Registration makes a rig a supported product capability.

## Intentionally Orbit-Specific

- orbit geometry and depth ordering;
- card shape drawing and Orbit-specific settings controls;
- the Luma Field four-card demo artwork;
- Orbit Carousel settings ranges and validation;
- Orbit Carousel renderer internals.

Shared UI may render these through the active definition, but must not reproduce their metadata or requirements independently.
