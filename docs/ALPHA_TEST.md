# MotionKit Spatial Alpha Test

## Product Name

MotionKit Spatial

## Alpha Purpose

This alpha tests the complete Orbit Carousel and Film Strip workflows plus the visual rig library. The goal is to learn whether users understand motion families and production versus roadmap status, find both motion systems useful, and trust local WebM and PNG export.

## What To Do

Use MotionKit Spatial to turn local images into an Orbit Carousel or Film Strip showcase, compare their controls and presets, then export WebM and PNG output.

## Recommended Setup

- Use a current Chromium browser such as Chrome or Edge for the most reliable WebM recording path.
- WebM codec and canvas recording support varies by browser and is checked when the export sheet opens.
- PNG exports one still frame and is not a replacement for a looping video.
- Uploaded media stays on the local device for the current browser session and must be re-added after reload.
- Safari and Firefox upload, focus, color, and export behavior still require manual verification.

## Test Flow

1. Open the app locally.
2. Open Browse rigs from first run or the workspace. Filter by Orbit, Stream, and a roadmap-only family. Confirm production previews move, roadmap cards are unavailable, and Escape returns focus.
3. Add 1–4 images or screenshots to Orbit Carousel.
4. Open Browse rigs and switch to Film Strip. Confirm the existing media remains and two empty frames are added.
5. Load the six-frame Northline Editorial demo and try all four Film Strip presets.
6. Change Film Strip width, height, gap, perspective, tilt, center scale, edge opacity, radius, direction, duration, and background.
7. Switch back to Orbit Carousel. Cancel the populated-overflow confirmation once and confirm the library remains open, then complete the switch and verify Orbit settings restore.
8. Try both rigs at 1:1, 16:9, and 9:16 with Transparent, Solid, and Gradient backgrounds.
9. Verify Film Strip WebM requires two valid images while PNG permits one.
10. Export WebM and PNG, inspect the files, then share feedback.

## Keyboard Shortcuts

- Space — Play or pause
- Left / Right Arrow — Step one frame while the stage or transport is focused
- Shift + Left / Right Arrow — Larger step
- 0 — Fit the stage
- Shift + F — Focus mode
- Escape — Close an open drawer or dialog when closing is allowed

Workspace tabs and mutually exclusive inspector/export controls support arrow-key navigation. Media reordering also provides Move earlier and Move later buttons as a keyboard alternative to dragging.

## Accessibility And Motion

- The stage exposes the current rig, media count, ratio, playback state, and coarse loop time to assistive technology without announcing every frame.
- Dialogs and narrow-screen drawers contain focus while open and return focus to their trigger when closed.
- When the operating system requests reduced motion, preview autoplay is disabled and non-essential transitions are minimized. Playback remains available through the visible Play control.
- Rig library previews become static when reduced motion is requested, and the library traps focus while open.
- Remove, Clear All, and Reset Rig provide confirmation or Undo recovery.

## Session Restoration

Each rig’s settings, ratio, background, active preset, panel collapse state, fit mode, and zoom are stored locally when available. Uploaded images are deliberately not persisted. After reload, the active rig and both rig states restore with empty media slots.

## Feedback Questions

- Did you understand what to do?
- Did the motion feel useful or just like a demo?
- Did the export look publishable?
- What confused you?
- What one thing would make this more useful?
- Where would you use this output?

## Known Limitations

- WebM is the only video format; PNG is available for still frames.
- MP4 not available yet.
- No project saving.
- Uploaded media does not persist across reloads.
- No timeline.
- No advanced export settings.
- Transparent WebM playback may vary by browser.
- WebM recording is capability-detected. Browsers without a supported canvas recording path use the explicitly confirmed PNG snapshot flow.
- The automated alpha pass currently covers the Chromium-based in-app browser. Safari and Firefox should be treated as unverified until their upload, color, focus, and export paths are manually exercised.
- Local prototype only.
