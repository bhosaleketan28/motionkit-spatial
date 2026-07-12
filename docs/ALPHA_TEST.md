# MotionKit Spatial Alpha Test

## Product Name

MotionKit Spatial

## Alpha Purpose

This alpha tests six complete motion families and the visual rig library. The goal is to learn whether each system feels structurally useful and distinct, whether switching remains safe, and whether users trust local WebM and PNG export.

## What To Do

Use MotionKit Spatial to compare Orbit Carousel, Film Strip, Grid Wall, Focus Deck, Stack Flow, and Wave Path, then export representative WebM and PNG output.

## Recommended Setup

- Use a current Chromium browser such as Chrome or Edge for the most reliable WebM recording path.
- WebM codec and canvas recording support varies by browser and is checked when the export sheet opens.
- PNG exports one still frame and is not a replacement for a looping video.
- Uploaded media stays on the local device for the current browser session and must be re-added after reload.
- Safari and Firefox upload, focus, color, and export behavior still require manual verification.

## Test Flow

1. Open the app locally.
2. Open Browse rigs from first run or the workspace. Confirm six animated production previews, six populated family filters, no duplicate roadmap cards, and reliable Escape focus return.
3. Add 1–4 images or screenshots to Orbit Carousel.
4. Open Browse rigs and switch to Film Strip. Confirm the existing media remains and two empty frames are added.
5. Load the six-frame Northline Editorial demo and try all four Film Strip presets.
6. Change Film Strip width, height, gap, perspective, tilt, center scale, edge opacity, radius, direction, duration, and background.
7. Load Grid Wall’s Atlas System demo. Test all ratios, Reverse, focus movement, gaps, and its four presets.
8. Switch to Focus Deck. Cancel the six-to-five overflow confirmation once, then complete it. Test hero transitions, support hierarchy, all ratios, and four presets.
9. Test Stack Flow’s Horizontal, Vertical, and Diagonal axes, front transition, all ratios, and four presets.
10. Test Wave Path at zero and high amplitude, both directions, tangent rotation, all ratios, and four presets.
11. Try Transparent, Solid, and Gradient backgrounds on each new rig. Verify Grid Wall WebM requires three items; Focus Deck, Stack Flow, and Wave Path require two; PNG permits one.
12. Export WebM and PNG, inspect the files, reload, and confirm the active rig/preset/settings restore while media returns empty.

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

Each rig’s settings, ratio, background, and active preset are stored independently. Panel collapse state, fit mode, and zoom are global. Uploaded images are deliberately not persisted. After reload, all six rig states remain available with empty media slots.

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
