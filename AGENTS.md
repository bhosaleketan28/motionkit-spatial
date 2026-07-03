# AGENTS.md

## Project

We are building MotionKit Spatial, a private local browser app inspired by spatial motion tools like Animos.

This is not a clone of Animos. Do not copy Animos code, branding, logo, assets, UI text, or proprietary implementation. Build an original local app from scratch.

The app should run entirely on the user's machine.

## Product Goal

MotionKit Spatial lets users create animated spatial design showcases by uploading images into reusable motion rigs.

The first MVP should focus on one working rig only:

- Orbit Carousel

## Core Product Primitive

The core primitive is a Motion Rig.

A Motion Rig is a reusable procedural animation system that defines:

- number of media slots
- card layout
- motion path
- timing
- visual parameters
- render behavior

## First MVP Scope

Build one local app with:

- React + Vite + TypeScript
- Canvas 2D renderer
- one working Orbit Carousel rig
- 4 media slots
- image upload into slots
- live animated preview
- play / pause
- replay or scrubber if simple
- frame ratio selector: 1:1, 16:9, 9:16
- basic right-side controls:
  - loop duration
  - spread
  - depth fade
  - card size
  - corner radius
  - background color
  - direction
- WebM export using canvas.captureStream + MediaRecorder
- PNG fallback if video export fails

## Non-Goals

Do not build:

- auth
- backend
- database
- payments
- cloud storage
- AI
- MP4 export
- team sharing
- project saving
- template marketplace
- full Animos clone
- 25 templates
- advanced landing page
- copied Animos UI or branding

## Engineering Rules

- Keep the first version frontend-only.
- Prefer simple readable TypeScript.
- Keep renderer logic separate from UI components.
- Keep rig definitions separate from renderer utilities.
- Keep export logic isolated in /src/export.
- Avoid heavy dependencies unless required.
- Use Canvas 2D first, not Three.js.
- Run lint/build after implementation if scripts exist.

## First Milestone

The first milestone is one complete local vertical slice:

upload images -> see orbit carousel animation -> adjust parameters -> export WebM

## Definition of Done

The app is successful when:

- it runs locally
- the Orbit Carousel animates smoothly
- uploaded images appear on cards
- controls update preview live
- WebM export downloads locally
- no backend is required
