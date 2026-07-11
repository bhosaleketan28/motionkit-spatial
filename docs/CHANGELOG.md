# MotionKit Spatial Changelog

## Completed Milestones

- Phase 1: App shell and orbit heartbeat
- Phase 1.5: Orbit motion polish
- Phase 2: Media slots
- Phase 3: Rig controls
- Phase 4: Local WebM export
- Phase 5: Export QA and visual trust
- Phase 6: Alpha usability hardening
- Phase 6.2: Workspace scroll behavior and background modes
- Phase 6.3: Alpha test package
- Phase 7: First-use polish and demo start
- Phase 7.1: Premium UI polish
- Phase 8: UX architecture redesign
- Phase 9: Stage-first workspace architecture
- Phase 9.1: Motion transport and scrubbing
- Phase 9.2: Export confidence
- Phase 9.3: Media workflow
- Phase 9.4: Precision inspector and output controls
- Phase 9.5: Accessibility, recovery, and product hardening

## Phase 8 Highlights

- Added a focused first-run screen with demo and four-image upload entry paths.
- Added a compact editor top bar for playback, reset, and export.
- Reworked the left sidebar into Create, Media, and Presets workspace navigation.
- Made the canvas stage the dominant editor surface with fit and frame-ratio controls.
- Replaced the settings stack with collapsible Motion, Appearance, Background, and Export inspector sections.
- Added clearer export metadata, status states, and responsive editor behavior.

## Phase 9 Highlights

- Rebuilt the editor as a fixed-height, stage-first workspace.
- Added independently collapsible desktop media and inspector rails.
- Added mutually exclusive tablet drawers and mobile bottom sheets.
- Added stage-only focus mode, zoom controls, and real fit-to-window behavior.
- Consolidated playback into the stage and export into the top bar.
- Stabilized canvas measurements with guarded, animation-frame-scheduled resize handling.

## Phase 9.1 Highlights

- Added a canonical stage transport with play/pause, replay, scrubber, current time, total duration, and loop status.
- Added live click-to-seek and drag-to-scrub behavior backed by the preview's existing progress clock.
- Added synchronized replay, duration changes, and frame stepping without per-frame React rendering.
- Added Left/Right Arrow stepping at 1/30 second and Shift+Left/Right stepping at 0.25 second.
- Added accessible transport labels, playback announcements, range semantics, and responsive transport layouts.

## Phase 9.2 Highlights

- Replaced immediate export with a focused review sheet showing format, dimensions, ratio, duration, FPS, background, filename, estimated time, and browser capability.
- Added WebM capability preflight for MediaRecorder, canvas capture streams, and preferred codec availability.
- Added Standard and High output resolutions plus 30 and 60 FPS WebM options.
- Added real loop-render progress with Preparing, Rendering, Encoding, Finalizing, Downloading, and Complete phases.
- Added safe cancellation that stops the render loop, recorder, and media tracks without downloading partial output.
- Removed silent WebM-to-PNG switching; PNG snapshots now require explicit user confirmation.
- Added detailed completion metadata and specific unsupported-browser, media, recorder, encoding, cancellation, and download failure states.
- Added modal focus containment, Escape handling, reduced-motion support, and mobile bottom-sheet behavior.

## Phase 9.3 Highlights

- Added incremental one-to-four image loading that fills the next available slot without replacing existing media.
- Rebuilt Media as a compact sequence manager with dropzone states, thumbnails, selected-slot identity, replace/remove actions, and local-file guidance.
- Added drag reordering and keyboard-operable Move earlier/later controls while retaining decoded image objects.
- Added a preview-only selected-card highlight that never enters WebM or PNG output.
- Added recoverable remove and clear-all actions with delayed object-URL cleanup and an eight-second Undo action.
- Kept the editor open after all media is cleared, with stage placeholders plus Add images and Load demo recovery paths.
- Added specific unsupported-format, duplicate, 25 MB size-limit, and decode-error feedback.
- Updated first run to accept one to four images while keeping demo content as a secondary path.
- Added live-region announcements for selection, reorder, removal, restore, and media loading outcomes.
- Documented that media stays local, is held only for the current browser session, and must be re-added after reload.

## Phase 9.4 Highlights

- Paired loop duration, spread, depth fade, card size, and corner radius sliders with synchronized typed numeric fields.
- Added clamping and protected draft editing so invalid or non-numeric values never reach the Canvas renderer.
- Added normal, Shift-modified, and Alt/Option fine keyboard increments tailored to each numeric property.
- Added isolated reset controls and subtle modified-state indicators for numeric, direction, shape, mode, and color properties.
- Replaced the stage ratio segments with a native, keyboard-accessible ratio select and connected the export ratio control to the same setting.
- Added an Include background toggle, context-aware background mode selection, and preview-only transparency guidance.
- Added aligned color swatches and hex fields with three- and six-digit normalization, immediate preview updates, and polite validation feedback.
- Reorganized export review into compact Format, Resolution, FPS, Ratio, Duration, Background, and Filename rows with exact WebM/PNG action labels.
- Increased inspector working labels to 14px, metadata to at least 12px, and narrow-screen targets to approximately 40–42px.

## Phase 9.5 Highlights

- Added keyboard arrow navigation and roving focus for workspace tabs, inspector radio groups, and export option groups.
- Added a coarse, non-live stage description with rig, media count, ratio, playback state, current time, and duration.
- Stopped editor and first-run autoplay when the system requests reduced motion and added a visible first-run Play/Pause control.
- Expanded reduced-motion CSS to drawers, workspace transitions, loading shimmer, notices, hover motion, and export progress transitions without hiding essential progress.
- Consolidated transient recovery, export, session, warning, and error feedback into one controlled notice surface with appropriate polite/assertive behavior.
- Added Reset Rig confirmation plus Undo while retaining immediate per-property resets.
- Persisted safe non-media workspace settings to localStorage with schema validation, corruption fallback, and unavailable-storage warnings.
- Restored saved settings into an empty editor with a clear local-media re-add message instead of pretending media persisted.
- Added a lightweight keyboard shortcut reference to workspace utilities.
- Added accurate radio, tab, group, busy, expanded, selected, disabled, and range-value semantics across the core workflow.
- Re-audited object URL, MediaRecorder, stream track, animation frame, ResizeObserver, timer, abort listener, and event-listener cleanup paths.
