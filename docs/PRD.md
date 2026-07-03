# MotionKit Spatial PRD

## Product Summary

MotionKit Spatial is a private local web app for creating animated spatial design showcases.

It is inspired by the category of spatial motion tools, but it must be built from scratch and must not copy Animos code, logo, assets, branding, UI, or proprietary implementation.

## Core Idea

Users upload images into media slots, choose a motion rig, adjust simple spatial parameters, preview the animation, and export a WebM.

## Target User

Designers, creators, product marketers, and visual teams who want to quickly showcase designs, product screens, or image sets in motion without using After Effects, Blender, or complex 3D tools.

## Core Job To Be Done

Help me turn a few static images into a polished animated spatial showcase that I can export and share.

## First MVP

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

Motion rig list.

For MVP:

- Orbit Carousel active
- Film Strip placeholder
- Card Totem placeholder
- Showcase Stream placeholder

Only Orbit Carousel should work.

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

Do not use Three.js in the first version unless Canvas 2D proves insufficient.

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
