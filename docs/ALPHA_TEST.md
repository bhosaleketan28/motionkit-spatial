# MotionKit Spatial Alpha Test

## Product Name

MotionKit Spatial

## Alpha Purpose

This alpha is a small local prototype test for the Orbit Carousel rig. The goal is to learn whether users understand the workflow, find the motion useful, and trust the WebM export enough to use or share it.

## What To Do

Use MotionKit Spatial to turn one to four static images or screenshots into a short animated spatial showcase, then complete the set and export the result as a WebM or PNG snapshot.

## Recommended Setup

- Use a current Chromium browser such as Chrome or Edge for the most reliable WebM recording path.
- WebM codec and canvas recording support varies by browser and is checked when the export sheet opens.
- PNG exports one still frame and is not a replacement for a looping video.
- Uploaded media stays on the local device for the current browser session and must be re-added after reload.
- Safari and Firefox upload, focus, color, and export behavior still require manual verification.

## Test Flow

1. Open the app locally.
2. Add 1–4 images or screenshots, then complete any empty slots before export.
3. Try 1:1, 16:9, and 9:16.
4. Try Transparent, Solid, and Gradient background modes.
5. Adjust spread, depth fade, card size, corner radius, loop duration, and direction.
6. Review all three ratios in the export sheet and confirm dimensions remain readable.
7. Export WebM.
8. Select PNG and confirm that video-only settings disappear before acknowledging the still-frame export.
9. Open the exported WebM in Chrome.
10. Share feedback.

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
- Remove, Clear All, and Reset Rig provide confirmation or Undo recovery.

## Session Restoration

Rig settings, ratio, background, panel collapse state, fit mode, and zoom are stored locally when available. Uploaded images are deliberately not persisted. After reload, the editor restores safe settings with four empty media slots and asks the tester to re-add local images.

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
