# MotionKit Spatial Rig Architecture

## Purpose

The Motion Rig is the product-level extension boundary. Phase 13 validates it across six production rigs with distinct settings, slot counts, renderers, media requirements, presets, export thresholds, families, and isolated gallery previews.

## Definition Contract

`RigDefinition<Settings>` is declared in `src/rigs/types.ts`. A definition contains:

- stable `id`, `name`, category, descriptions, accessibility description, family, discovery tags, production maturity, gallery description, and version;
- `slotCount` and one `slotLabel` per position;
- supported ratios, default ratio, and fully validated default settings;
- accepted media types, size limit, item range, preferred dimensions, and export requirement;
- ordered inspector section metadata and feature capabilities;
- declarative numeric and choice inspector controls, including ranges, display scale, precision, units, and keyboard steps;
- a renderer receiving frame, progress, settings, slot count, media, selection, and preview-guide state;
- export duration, filename prefix, and transparency metadata;
- preset schema compatibility metadata;
- a collection of compatible, rig-owned preset definitions;
- a rig-owned demo media generator;
- a rig-owned gallery preview recipe with isolated settings, generated media, ratio, duration, static progress, and the actual renderer;
- an `isSettings` validator used by session restoration.

## Registry

`src/rigs/registry.ts` is the only registration point. It:

- registers Orbit Carousel, Film Strip, Grid Wall, Focus Deck, Stack Flow, and Wave Path;
- resolves rigs by id;
- falls back to Orbit Carousel for missing or invalid ids;
- validates unique ids, family and maturity values, tags, gallery/accessibility copy, preview settings/media/ratio/duration, slot-label counts, media limits, default ratios, settings, duration metadata, transparency capabilities, and exactly four compatible presets per rig during startup.

Roadmap entries live in `src/rigs/roadmap.ts`, are limited to four, and are never registered. Phase 13 leaves this list empty because all previous concepts now satisfy the production contract.

## Gallery Preview Runtime

`src/preview/rigPreviewRuntime.ts` builds preview settings from validated rig defaults plus the rig-owned override, generates preview media once per rig/version/media-count key, decodes it once, and caches the resulting promise. Preview media is independent of workspace uploads and requires no object URLs.

`RigGallery` owns one scheduler for all open production cards. It throttles animation to approximately 22 FPS, paints only Intersection Observer-visible cards, pauses when the document is hidden, stops when the gallery unmounts, and performs no per-frame React state updates. Reduced-motion users receive the rig-defined static frame and no scheduler loop.

## Preset Contract

`RigPreset<Settings>` is a versioned patch owned by one rig. A preset declares:

- stable `id`, `rigId`, name, description, and compact preview style;
- a settings schema id and version that must match the rig’s preset compatibility contract;
- `settingsPatch`, containing only values the preset intends to change;
- `ownedProperties`, the exact keys the preset may write.

The rig definition exposes its preset collection. `src/rigs/presetRegistry.ts` derives the visible registry from registered rigs and resolves presets by the compound `rigId:presetId` identity. Shared UI never contains preset names or values.

Application is guarded in `src/rigs/presetSystem.ts`. It rejects incompatible versions, foreign rig ids, undeclared patch keys, missing owned values, unknown properties, and patches that fail the rig settings validator. Valid application copies only owned properties over the current settings. Media, transport state, workspace state, and unowned rig settings remain intact.

The workspace stores the active preset id with the validated settings. “Applied” is derived by comparing current owned values with the preset patch; any later change to an owned value becomes “Modified.” Reapply restores only those owned values. Old sessions migrate with no active preset, and missing or incompatible preset ids are ignored while compatible rig settings are preserved.

## Multi-Rig State And Media

Session version 5 stores `activeRigId` and a `rigStates` record keyed by registered rig id. Each entry contains validated settings—including ratio and background—and the compatible active preset id. Version 1–4 sessions migrate safely; missing new rigs receive defaults, invalid states reset independently, and unavailable preset ids clear without discarding compatible settings.

Media remains memory-only and is shared only while the app is open. Rig switching retains existing `ImageSlot` objects and decoded images when their positions fit the target rig. Larger rigs append empty slots with new stable ids. Smaller rigs require confirmation when populated overflow exists, then revoke only discarded object URLs.

## Film Strip Geometry

Film Strip derives a repeating horizontal track from progress 0–1. Each frame has a stable sequence position; modulo wrapping produces a seamless boundary. Ratio-aware card dimensions and spacing avoid uniform scaling across 16:9, 1:1, and 9:16. Distance from center drives scale and opacity, tilt affects the track line, and optional perspective adds controlled center depth. Preview selection is passed separately and never enters export renders.

## Phase 13 Renderer Geometry

- Grid Wall assigns fixed row/column centers by ratio. A periodic drift vector moves the grid, while cyclic distance to a continuous focal phase controls scale, opacity, depth pull, and draw order.
- Focus Deck defines one hero target and four ratio-specific support targets. Every card carries a continuous queue coordinate and interpolates between adjacent roles using configurable smoothstep blending.
- Stack Flow defines six authored depth targets along a horizontal, vertical, or diagonal vector. Cards interpolate around the cyclic target list; the front segment adds a deterministic exit arc without circular travel.
- Wave Path maps normalized card progress to an extended open horizontal track. Wave sine, path tilt, tangent derivative, center proximity, and perspective determine y-position, rotation, scale, opacity, and depth ordering.

All four use shared cover-cropping, rounded clipping, attached card shadows, placeholder, and preview-only selection-outline helpers. Preview, editor, PNG, and WebM dispatch the same rig renderer.

## Phase 13 Rig Contracts

### Grid Wall

- Six slots labelled Tile 1–6; WebM requires three and PNG requires one.
- Default 16:9; 16:9 uses 3×2, while 9:16 and 1:1 use controlled 2×3 geometry.
- Settings cover duration, direction, tile width/height, horizontal/vertical gaps, grid and focus scale, focus depth, drift, radius, edge opacity, and background.
- Atlas System supplies six original demo/preview frames.
- Presets: Editorial Wall, Product Matrix, Social Mosaic, and Flat Grid.

### Focus Deck

- Five slots labelled Hero and Support 1–4; WebM requires two and PNG requires one.
- Default 16:9; portrait places a larger hero above a lower support deck, square compacts the surrounding supports, and landscape distributes them asymmetrically left and right.
- Settings cover duration, direction, hero width/height, support scale/spread, deck depth, hero emphasis, transition softness, side rotation, edge opacity, radius, and background.
- Forma One supplies five original demo/preview frames.
- Presets: Product Hero, Case Study, Campaign Focus, and Clean Presentation.

### Stack Flow

- Six slots labelled Card 1–6; WebM requires two and PNG requires one.
- Default 1:1 with responsive card sizing across all ratios.
- Settings cover duration, direction, stack axis, card width/height, offset, depth, back scale/opacity, front exit distance, rotation step, transition softness, radius, and background.
- Mono Editions supplies six original demo/preview frames.
- Presets: Layered Deck, Editorial Stack, Social Cards, and Minimal Pile.

### Wave Path

- Six slots labelled Frame 1–6; WebM requires two and PNG requires one.
- Default 16:9; landscape uses a broad wave, portrait strengthens vertical movement while extending the off-canvas track, and square uses balanced open-path geometry.
- Settings cover duration, direction, card width/height, gap, wave amplitude/frequency, path tilt, perspective, center scale, edge opacity, tangent rotation, radius, and background. Zero amplitude is a valid flat path.
- Current Studio supplies six original demo/preview frames.
- Presets: Cinematic Wave, Editorial Ribbon, Social Flow, and Flat Path.

## Adding A Future Rig

1. Define the rig settings type and settings validator.
2. Implement its renderer without importing workspace components.
3. Add a rig-owned demo generator with exactly `slotCount` results.
4. Define any presets beside the rig, with unique ids, explicit owned properties, and matching schema/version metadata.
5. Create a complete `RigDefinition` with media, inspector, export, capability, preset, and version metadata.
6. Assign one stable motion family and useful discovery tags, then provide a concise gallery description and isolated preview recipe using the real renderer.
7. Add any intentionally specialized inspector implementation behind the definition’s section and capability contract.
8. Register the definition in the central registry.
9. Verify preset application and modification, partial media, full media, reorder, selection, undo, all supported ratios, transport behavior, gallery preview, WebM, PNG, session migration, focus behavior, reduced motion, and responsive layouts.

Do not register placeholder or incomplete rigs. Registration makes a rig a supported product capability.

## Intentionally Orbit-Specific

- orbit geometry and depth ordering;
- card shape drawing and Orbit-specific settings controls;
- the Luma Field four-card demo artwork;
- Orbit Carousel settings ranges and validation;
- Orbit Carousel renderer internals.

Shared UI may render these through the active definition, but must not reproduce their metadata or requirements independently.
