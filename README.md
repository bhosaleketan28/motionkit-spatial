# MotionKit Spatial

MotionKit Spatial is a private local browser app for creating cinematic spatial motion from your visuals. It includes six production-ready motion systems: Orbit Carousel, Grid Wall, Focus Deck, Film Strip, Wave Path, and Stack Flow.

Users can add local images or load a rig-specific demo, preview deterministic Canvas 2D motion, adjust precision controls, and export a local WebM or PNG.

The Phase 14.2 editor opens with a focused first-run screen, offers three credible showcase paths, then moves into a fixed, stage-first creative workspace. Its visual system stays 95% monochrome and uses an original violet-to-cyan Motion Spectrum only for creation actions, motion progress, and selected creation states. Six structurally distinct systems run through reusable rig definitions in one validated registry and appear in a visual, family-filtered library.

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
- Premium monochrome-first creative-tool identity with a restrained Motion Spectrum and no decorative glow system
- Spectrum creation actions, active motion indicators, selected states, slider/progress fills, and solid cyan focus rings with accessible contrast
- Task-oriented first run with Add your images, Try a showcase, and Browse motion systems paths
- Three guided showcase scenarios: Product Showcase, Editorial Story, and Brand Campaign
- Concise in-app alpha guide with workflow guidance, browser limitations, and a no-account feedback path
- Generic UI-facing rig contract with a validated central registry and safe fallback lookup
- Eight-family motion taxonomy covering orbit, stream, grid, focus, stack, cluster, path, and depth
- Responsive visual rig library with six actual production-renderer previews
- Presentation-reviewed gallery order—Orbit, Grid, Focus, Film, Wave, Stack—with at most two explicit Featured recommendations
- Preview-only framing recipes that keep every motion structure legible without changing workspace or export geometry
- One visibility-aware 22 FPS preview scheduler with cached demo media, page-visibility pausing, and static reduced-motion frames
- Generic versioned preset contract with explicit rig ownership, compatibility, and property ownership
- Four Orbit Carousel starting points: Cinematic, Clean Studio, Launch Glow, and Minimal Light
- Canvas 2D Film Strip renderer with six media frames, seamless horizontal wrapping, center emphasis, perspective, tilt, and edge falloff
- Four Film Strip starting points: Editorial Flow, Cinematic Sweep, Social Stream, and Flat Gallery
- Grid Wall with six authored tiles, ratio-aware 3×2 or 2×3 layouts, continuous focal weighting, and four presets
- Focus Deck with a cyclic hero/support role system, five slots, asymmetric ratio-aware decks, and four presets
- Stack Flow with six-card layered queue geometry, three stack axes, a smooth front exit, and four presets
- Wave Path with six frames on an open normalized curve, amplitude/frequency/tangent controls, and four presets
- Registry-driven rig library with safe media preservation and confirmed overflow removal
- Separate settings, ratio, background, and active preset state for each rig
- Functional Presets workspace with text-based Applied/Modified status, keyboard radio navigation, reapply, and rig-default recovery
- Preset application that preserves media, playback, frame ratio, direction, card shape, and every other unowned setting
- Canvas 2D Orbit Carousel renderer
- Original locally generated Luma Field campaign presentation cards for first-use testing
- Original locally generated Northline Editorial six-frame Film Strip demo
- Rig-defined local media slots—four, five, or six depending on the active rig—with incremental add, thumbnails, replace, remove, and clear-all
- Compact populated-media state that prioritizes sequence, selection, replacement, and reordering
- Stable media selection with preview-only stage highlighting that is excluded from exports
- Drag reordering plus keyboard-operable Move earlier/later controls
- Undo recovery for remove and clear-all without re-decoding reordered media
- Confirmed Reset Rig workflow with a global Undo action
- Specific validation for unsupported, duplicate, oversized, and undecodable images
- Premium dark editor shell with grouped controls
- First-run 1–4 image entry flow with real renderer-owned preview media and three generated showcase options
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
- Version 5 session persistence for six independent rig states plus safe version 1–4 migration and per-rig recovery
- Unified success, warning, error, info, and Undo notices with controlled live-region behavior
- Actual loop-render progress phases, elapsed and remaining time, safe cancellation, and detailed completion metadata
- Explicitly confirmed PNG snapshot fallback when WebM is unavailable or fails
- In-app alpha notes covering recommended browsers, WebM differences, local-media lifetime, and unverified Safari/Firefox paths
- Direct empty-media and export-readiness recovery actions that return users to Media without a dead end
- Keyboard skip link, visible focus treatment, modal focus containment, and trigger focus return
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

Orbit Carousel, Film Strip, Grid Wall, Focus Deck, Stack Flow, and Wave Path are registered production rigs. Each definition owns its metadata, motion family, searchable tags, gallery description, preview recipe, slot contract, ratios, default settings, declarative inspector controls, renderer, original demo generator, format-specific media requirements, export metadata, capabilities, exactly four compatible presets, validation, accessibility description, and version. Cluster and Depth remain empty taxonomy families and are hidden from the gallery.

The registry lives in `src/rigs/registry.ts`. Future rigs should be added as self-contained definitions and registered only after their renderer, settings validator, media contract, demo media, inspector behavior, gallery preview, export metadata, and session compatibility are complete. See `docs/RIG_ARCHITECTURE.md`, `docs/MOTION_FAMILIES.md`, `docs/ADDING_A_RIG.md`, and `docs/RIG_GALLERY.md`.

## Presentation QA

Phase 13.1 establishes a repeatable six-rig presentation baseline for alpha and investor walkthroughs: concise family-led naming, two Featured rigs, real-renderer previews with consistent 16:9 framing, task-oriented first run, persistent current-rig context, structured inspector sections, detailed completion metadata, and responsive keyboard-accessible gallery behavior. See `docs/PRESENTATION_QA.md` for the review matrix and demo script.

## Alpha Launch

Phase 14 prepares the product for a controlled external alpha. The primary tester goal is to create one useful motion output in under five minutes, starting from local images or one of three guided showcase scenarios. See `docs/ALPHA_LAUNCH.md` for the launch brief and `docs/ALPHA_TEST.md` for the focused tester script.

## Visual Identity

Phase 14.1 establishes the production UI identity: 95% neutral surfaces, 5% MotionKit Violet, Avenir-led typography where available, reduced border noise, and elevation reserved for blocking dialogs. Authored media, preset output palettes, and renderer card shadows remain independent from the application chrome. See `docs/VISUAL_IDENTITY.md` for the complete token and component rules.
