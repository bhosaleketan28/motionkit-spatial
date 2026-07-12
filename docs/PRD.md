# MotionKit Spatial PRD

## Product Summary

MotionKit Spatial is a private local web app for creating animated spatial design showcases.

It is inspired by the category of spatial motion tools, but it must be built from scratch and must not copy Animos code, logo, assets, branding, UI, or proprietary implementation.

## Core Idea

Users upload images into media slots, choose a motion rig, adjust simple spatial parameters, preview the animation, and export a WebM.

## Motion Rig Contract

A motion rig is a versioned product definition, not only a renderer. Each rig owns:

- identity, category, and user-facing descriptions;
- slot count, slot labels, and media requirements;
- supported and default frame ratios;
- validated default settings;
- inspector sections and supported capabilities;
- its Canvas renderer and demo media generator;
- export naming, duration, and transparency metadata;
- preset compatibility metadata.
- a versioned collection of rig-aware presets with explicit property ownership.

Available rigs are registered centrally and resolved by id. Missing or invalid ids fall back safely to Orbit Carousel. Phase 11 adds Film Strip as the second complete rig and introduces compact rig switching with per-rig state.

## Preset Workflow

Presets are intentional rig-specific starting points, not saved projects or global themes. The Presets workspace shows only definitions compatible with the active rig. Applying one updates its declared settings while preserving media and all unowned values. The product visibly distinguishes an unchanged Applied preset from a Modified preset, supports reapplication, and provides a return-to-rig-defaults path.

Orbit Carousel includes exactly four presets:

- Cinematic
- Clean Studio
- Launch Glow
- Minimal Light

Film Strip includes exactly four presets:

- Editorial Flow
- Cinematic Sweep
- Social Stream
- Flat Gallery

## Film Strip

Film Strip is a continuous horizontal track of up to six rectangular media frames. Progress deterministically offsets a repeating track; cards wrap seamlessly, preserve cover-cropped image proportions, and gain controlled scale and opacity near the center. Ratio-aware geometry shows more of the track in 16:9, stronger center emphasis in 9:16, and balanced spacing in 1:1.

Its inspector owns duration, direction, card width and height, gap, perspective, tilt, center scale, edge opacity, corner radius, and background. WebM requires two valid images; PNG requires one.

Switching rigs preserves media order and decoded image identity when compatible. Growing from four to six slots adds empty frames. Shrinking to four slots requires confirmation before populated overflow is removed. Each rig restores its own validated settings and active preset.

## Target User

Designers, creators, product marketers, and visual teams who want to quickly showcase designs, product screens, or image sets in motion without using After Effects, Blender, or complex 3D tools.

## Core Job To Be Done

Help me turn a few static images into a polished animated spatial showcase that I can export and share.

## Supported Rigs

Build one working motion rig:

### Orbit Carousel

A 3D-like carousel of image cards rotating around a central focus area.

The effect can be created with Canvas 2D using:

- sin/cos positioning
- scale changes
- opacity/depth fade
- z-order sorting
- rounded card drawing
- shadows
- simple perspective illusion

### Film Strip

A cinematic editorial stream with six media slots, horizontal looping motion, adjustable card framing, gap, perspective, tilt, center scale, edge opacity, radius, direction, and background.

## MVP User Flow

1. User opens local app.
2. User sees Orbit Carousel preview with placeholder cards.
3. User uploads images into 4 media slots.
4. Uploaded images appear on orbiting cards.
5. User adjusts controls.
6. User plays/pauses animation.
7. User exports WebM locally.

## Required Controls

- Frame ratio: 1:1, 16:9, 9:16
- Loop duration
- Spread
- Depth fade
- Card size
- Corner radius
- Background color
- Direction: clockwise / counter-clockwise

## Required Panels

### Left Panel

The compact rig selector, active rig presets, and active media sequence. Only complete registered rigs are shown.

### Center Stage

Canvas preview.

Must show:

- frame boundary
- animated orbit carousel
- play / pause
- simple progress indicator if feasible

### Right Panel

Frame controls, media slots, and rig controls.

## Technical Direction

Use:

- React
- Vite
- TypeScript
- Canvas 2D
- MediaRecorder for WebM export
- A generic rig definition contract and validated registry

Do not use Three.js in the first version unless Canvas 2D proves insufficient.

Rig-specific geometry and control implementations may remain specialized, but workspace metadata, media sizing, stage descriptions, ratio availability, export validation, demo generation, and session ownership must flow through the active rig definition.

## Export

Use:

- canvas.captureStream()
- MediaRecorder
- WebM download
- PNG fallback if recording is unavailable

## Non-Goals

Do not build:

- login
- backend
- database
- MP4 export
- cloud storage
- project saving
- AI
- billing
- advanced template marketplace
- copied Animos UI or branding

## Success Criteria

The MVP is successful if a user can upload 4 images, see them orbit in a polished 3D-like carousel, adjust simple controls, and export a usable WebM from their browser.
