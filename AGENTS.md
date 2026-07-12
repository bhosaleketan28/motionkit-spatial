# AGENTS.md

## Project

We are building MotionKit Spatial, a private local browser app inspired by spatial motion tools like Animos.

This is not a clone of Animos. Do not copy Animos code, branding, logo, assets, UI text, or proprietary implementation. Build an original local app from scratch.

The app should run entirely on the user's machine.

## Product Goal

MotionKit Spatial lets users create animated spatial design showcases by uploading images into reusable motion rigs.

The current supported rig set is:

- Orbit Carousel
- Film Strip
- Grid Wall
- Focus Deck
- Stack Flow
- Wave Path

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
- six working production rigs registered through the shared contract
- rig-defined media slots: 4 for Orbit Carousel, 5 for Focus Deck, and 6 for Film Strip, Grid Wall, Stack Flow, and Wave Path
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
- Treat `RigDefinition<Settings>` as the UI-facing source of truth for rig metadata and behavior.
- Require every production rig to declare one stable motion family, useful discovery tags, production maturity, gallery copy, and an isolated real-renderer preview recipe.
- Register rigs only in `src/rigs/registry.ts`; never add scattered id-based lookup tables.
- Keep incomplete roadmap concepts outside the production registry, visibly unavailable, and limited to four gallery entries.
- Do not hardcode slot counts, slot labels, supported ratios, export requirements, or rig names in shared UI.
- Keep rig-specific renderers, settings validation, and demo generation beside the rig definition.
- A future rig must provide a complete media, inspector, renderer, export, session, capability, and version contract before it is registered.
- Invalid or unavailable rig ids must resolve through the registry fallback rather than crashing or exposing stale settings.
- Keep gallery previews independent from workspace media and settings; use cached generated media and one visibility-aware scheduler without per-frame React state.
- Prefer shared pure geometry and Canvas card helpers for reusable math and drawing, while leaving genuinely rig-specific composition inside its renderer.

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
