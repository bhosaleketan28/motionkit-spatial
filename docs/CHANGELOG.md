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
