# MotionKit Spatial

MotionKit Spatial is a private local browser prototype for creating animated spatial motion from screenshots. The current MVP focuses on one motion rig: Orbit Carousel.

Users can add one to four images incrementally or load generated demo cards, preview a smooth Canvas 2D orbit animation, adjust basic rig settings, and export a local WebM file.

The Phase 10 editor opens with a focused first-run screen, then moves into a fixed, stage-first creative workspace. Orbit Carousel now runs through a reusable rig definition and validated registry rather than being hardcoded across the product. Desktop media and inspector rails can collapse, tablet and mobile controls open in drawers, and a compact motion transport provides playback, replay, scrubbing, and precise time inspection without introducing a full timeline editor.

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
- Canvas 2D Orbit Carousel renderer
- Original locally generated Luma Field showcase cards for first-use testing
- Four local media slots with incremental multi-image add, thumbnail previews, replace, remove, and clear-all
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
- Safe localStorage restoration for rig settings, ratio, panel collapse state, fit mode, and zoom
- Versioned session persistence for active rig id plus safe migration of pre-registry sessions
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

Orbit Carousel is the only registered rig. Its definition owns its metadata, slot contract, ratios, default settings, media requirements, inspector sections, renderer, demo generator, export metadata, capabilities, preset compatibility, settings validation, and version.

The registry lives in `src/rigs/registry.ts`. Future rigs should be added as self-contained definitions and registered only after their renderer, settings validator, media contract, demo media, inspector behavior, export metadata, and session compatibility are complete. See `docs/RIG_ARCHITECTURE.md` for the extension checklist.
