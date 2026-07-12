# MotionKit Spatial

MotionKit Spatial is a private local browser prototype for creating animated spatial motion from screenshots. It currently includes two production-ready motion rigs: Orbit Carousel and Film Strip.

Users can add local images or load a rig-specific demo, preview deterministic Canvas 2D motion, adjust precision controls, and export a local WebM or PNG.

The Phase 12 editor opens with a focused first-run screen, then moves into a fixed, stage-first creative workspace. Orbit Carousel and Film Strip run through reusable definitions in one validated registry and appear in a visual, family-filtered rig library. Each rig owns its renderer, media contract, inspector schema, presets, demo, ratios, export requirements, family metadata, and gallery preview. Desktop rails collapse, tablet and mobile controls open in drawers, and the shared transport provides playback, replay, scrubbing, and precise inspection without introducing a timeline.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Deploy To Vercel

Deploy this project as a Vite app on Vercel.

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

The app is static and browser-only. Uploaded images are processed locally in the user's browser and are not saved or uploaded by MotionKit Spatial.

## Current Features

- React + Vite + TypeScript local app
- Generic UI-facing rig contract with a validated central registry and safe fallback lookup
- Eight-family motion taxonomy covering orbit, stream, grid, focus, stack, cluster, path, and depth
- Responsive visual rig library with actual renderer previews for production rigs and clearly unavailable roadmap concepts
- One visibility-aware 22 FPS preview scheduler with cached demo media, page-visibility pausing, and static reduced-motion frames
- Generic versioned preset contract with explicit rig ownership, compatibility, and property ownership
- Four Orbit Carousel starting points: Cinematic, Clean Studio, Launch Glow, and Minimal Light
- Canvas 2D Film Strip renderer with six media frames, seamless horizontal wrapping, center emphasis, perspective, tilt, and edge falloff
- Four Film Strip starting points: Editorial Flow, Cinematic Sweep, Social Stream, and Flat Gallery
- Registry-driven rig library with safe media preservation and confirmed overflow removal
- Separate settings, ratio, background, and active preset state for each rig
- Functional Presets workspace with text-based Applied/Modified status, keyboard radio navigation, reapply, and rig-default recovery
- Preset application that preserves media, playback, frame ratio, direction, card shape, and every other unowned setting
- Canvas 2D Orbit Carousel renderer
- Original locally generated Luma Field showcase cards for first-use testing
- Original locally generated Northline Editorial six-frame Film Strip demo
- Rig-defined local media slots—four for Orbit Carousel and six for Film Strip—with incremental add, thumbnails, replace, remove, and clear-all
- Compact populated-media state that prioritizes sequence, selection, replacement, and reordering
- Stable media selection with preview-only stage highlighting that is excluded from exports
- Drag reordering plus keyboard-operable Move earlier/later controls
- Undo recovery for remove and clear-all without re-decoding reordered media
- Confirmed Reset Rig workflow with a global Undo action
- Specific validation for unsupported, duplicate, oversized, and undecodable images
- Premium dark editor shell with grouped controls
- First-run 1–4 image entry flow with a secondary generated demo option
- Compact editor top bar with canonical export and secondary reset actions
- Collapsible desktop media and inspector rails with responsive drawers and bottom sheets
- Stage-only focus mode with zoom and fit-to-window controls
- Synchronized motion transport with play/pause, replay, scrubber, loop indicator, and time display
- Frame stepping at 1/30 second and 0.25 second increments
- Frame ratios: 1:1, 16:9, 9:16
- Rig controls for duration, spread, depth fade, card size, corner radius, and direction
- Synchronized slider and numeric entry with clamping, modifier-key increments, units, and per-property resets
- Shared stage/export ratio dropdowns backed by one frame-ratio setting
- Context-aware background inclusion, mode, and validated three- or six-digit hex controls
- Card shape control: Rectangle, Square, Circle, Star
- Background modes: Transparent, Solid, Gradient
- Local WebM export with an explicit PNG snapshot alternative
- Export review with format, dimensions, FPS, quality, duration, filename, and browser capability preflight
- Format-aware PNG review that hides video-only settings and requires explicit still-frame acknowledgement
- Compact output rows for format, resolution, FPS, ratio, duration, background, and filename
- Keyboard-accessible tabs and radio groups, trapped drawer/dialog focus, and reliable trigger focus return
- Accessible stage description covering rig, loaded media, ratio, playback state, and coarse loop time
- System reduced-motion support: previews start paused and non-essential transitions are minimized
- Safe localStorage restoration for per-rig settings, ratios, backgrounds, presets, panel collapse state, fit mode, and zoom
- Versioned session persistence for active rig plus safe version 1–3 migration and incompatible-state recovery
- Unified success, warning, error, info, and Undo notices with controlled live-region behavior
- Actual loop-render progress phases, elapsed and remaining time, safe cancellation, and detailed completion metadata
- Explicitly confirmed PNG snapshot fallback when WebM is unavailable or fails
- In-app alpha notes covering recommended browsers, WebM differences, local-media lifetime, and unverified Safari/Firefox paths
- Preview-only frame guide so exports render as clean compositions

## Current Limitations

- WebM is the only video format; PNG is available for still frames
- MP4 not available yet
- No backend, auth, database, or cloud storage
- No project saving
- Media is memory-only and must be added again after a page reload
- Restored sessions reopen with empty media slots and an explicit re-add-images message
- WebM capability is detected at runtime; browsers without canvas WebM recording receive an explicit PNG-only path
- The current automated browser pass verifies the Chromium-based in-app browser. Safari and Firefox export behavior remains capability-gated but was not directly automated in this environment.
- No full timeline, layers, keyframes, or advanced sequencing
- No advanced export settings
- Transparent WebM playback may vary by browser
- Local prototype only

## Rig Architecture

Orbit Carousel and Film Strip are registered production rigs. Each definition owns its metadata, motion family, searchable tags, gallery description, preview recipe, slot contract, ratios, default settings, declarative inspector controls, renderer, demo generator, format-specific media requirements, export metadata, capabilities, compatible presets, validation, and version. Grid Wall, Focus Deck, Stack Flow, and Wave Path are non-interactive roadmap entries and are deliberately kept outside the production registry.

The registry lives in `src/rigs/registry.ts`. Future rigs should be added as self-contained definitions and registered only after their renderer, settings validator, media contract, demo media, inspector behavior, gallery preview, export metadata, and session compatibility are complete. See `docs/RIG_ARCHITECTURE.md`, `docs/MOTION_FAMILIES.md`, `docs/ADDING_A_RIG.md`, and `docs/RIG_GALLERY.md`.
