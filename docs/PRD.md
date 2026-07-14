# MotionKit Spatial PRD

## Product Summary

MotionKit Spatial is a private local web app for creating cinematic spatial motion from a user's own visuals.

It is inspired by the category of spatial motion tools, but it must be built from scratch and must not copy Animos code, logo, assets, branding, UI, or proprietary implementation.

## Core Idea

Users add images into media slots, choose a motion system, apply a curated starting point, adjust spatial parameters, inspect the animation, and export a local WebM or PNG still.

## Visual Identity

MotionKit Spatial should feel like a premium motion design instrument rather than a developer dashboard or productivity application. The application chrome uses a 95% neutral, 5% accent balance built from near-black surfaces and MotionKit Violet.

- Background, panels, elevated surfaces, and borders form a quiet monochrome hierarchy.
- Violet identifies primary creation actions, active and selected states, keyboard focus, motion progress, and the current motion system.
- Headings and strong labels use 600 weight; body and supporting copy use 400 weight.
- Small readable text uses accessible secondary or tertiary neutrals; the darkest muted token is reserved for disabled or non-essential decoration.
- Buttons, panels, and cards do not use decorative shadows or glow. Only renderer-owned card shadows and restrained blocking-dialog elevation are allowed.
- Product UI color never rewrites uploaded media, authored demo artwork, preset output palettes, background settings, or renderer geometry.

The full token and component contract is documented in `docs/VISUAL_IDENTITY.md`.

## Alpha Launch Experience

The first-run experience must explain the product within ten seconds and offer three clear paths: Add your images, Try a showcase, and Browse motion systems. The showcase launcher includes three original, locally generated scenarios:

- Product Showcase — Focus Deck with Product Hero;
- Editorial Story — Film Strip with Editorial Flow;
- Brand Campaign — Grid Wall with Editorial Wall.

Each scenario loads a complete working example through the existing registry, preset, media, and renderer contracts. The alpha guide explains the four-step workflow, best-result guidance, current browser and persistence limitations, and a local feedback path without accounts or analytics.

External product copy should use “motion system” where possible. “Rig” remains the internal architecture term.

## Motion Rig Contract

A motion rig is a versioned product definition, not only a renderer. Each rig owns:

- identity, category, and user-facing descriptions;
- slot count, slot labels, and media requirements;
- supported and default frame ratios;
- validated default settings;
- inspector sections and supported capabilities;
- its Canvas renderer and demo media generator;
- export naming, duration, and transparency metadata;
- preset compatibility metadata;
- a versioned collection of rig-aware presets with explicit property ownership.
- motion family, discovery tags, maturity, gallery description, and an isolated renderer-preview recipe.

Available production rigs are registered centrally and resolved by id. Missing or invalid ids fall back safely to Orbit Carousel. Phase 13 includes six complete production rigs. Their presentation order is Orbit Carousel, Grid Wall, Focus Deck, Film Strip, Wave Path, and Stack Flow. The gallery has no roadmap cards; Cluster and Depth remain empty hidden families.

## Motion Families And Discovery

The stable family vocabulary is Orbit, Stream, Grid, Focus, Stack, Cluster, Path, and Depth. A family describes the dominant motion structure, while tags describe secondary qualities such as editorial, looping, perspective, hero, or multi-card. The rig library filters by families that currently contain a production or roadmap entry and always presents production rigs before roadmap concepts.

Production cards use a rig-owned preview contract that runs the real Canvas renderer with isolated default-derived settings and cached generated media. Preview scheduling is shared, visibility-aware, capped near 22 FPS, suspended while the page or library is hidden, and static when reduced motion is requested.

Orbit Carousel and Grid Wall are the current Featured entry points. Featured is a presentation recommendation, not a separate maturity level, and the production library must never feature more than two rigs at once. Every rig remains directly selectable and visibly marked as Production.

Gallery previews use presentation-only framing overrides. Those recipes may adjust scale, spacing, perspective, focus strength, or preview ratio to make the defining structure legible, but they must never alter workspace defaults, export settings, or the renderer's geometry contract.

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

Grid Wall includes Editorial Wall, Product Matrix, Social Mosaic, and Flat Grid. Focus Deck includes Product Hero, Case Study, Campaign Focus, and Clean Presentation. Stack Flow includes Layered Deck, Editorial Stack, Social Cards, and Minimal Pile. Wave Path includes Cinematic Wave, Editorial Ribbon, Social Flow, and Flat Path.

## Film Strip

Film Strip is a continuous horizontal track of up to six rectangular media frames. Progress deterministically offsets a repeating track; cards wrap seamlessly, preserve cover-cropped image proportions, and gain controlled scale and opacity near the center. Ratio-aware geometry shows more of the track in 16:9, stronger center emphasis in 9:16, and balanced spacing in 1:1.

Its inspector owns duration, direction, card width and height, gap, perspective, tilt, center scale, edge opacity, corner radius, and background. WebM requires two valid images; PNG requires one.

Switching rigs preserves media order and decoded image identity when compatible. Growing from four to six slots adds empty frames. Shrinking to four slots requires confirmation before populated overflow is removed. Each rig restores its own validated settings and active preset.

## Essential Motion Families

- Grid Wall uses six fixed authored cells. Ratio selects 3×2 or 2×3 geometry; periodic drift moves the group while continuous cyclic weighting changes focal scale, depth, opacity, and deterministic draw order. WebM requires three items; PNG requires one.
- Focus Deck uses five cyclic roles: one hero and four support targets. Cards interpolate continuously between role geometry so the incoming hero and outgoing support motion remain synchronized. WebM requires two items; PNG requires one.
- Stack Flow uses six depth targets and a cyclic queue. The front card moves into the stack through an axis-aware exit arc while the deepest card advances continuously to the front. WebM requires two items; PNG requires one.
- Wave Path distributes six cards along an open normalized track. Position, wave offset, tilt, tangent angle, center scale, opacity, and depth derive from progress; zero amplitude produces a flat path. WebM requires two items; PNG requires one.

## Target User

Designers, creators, product marketers, and visual teams who want to quickly showcase designs, product screens, or image sets in motion without using After Effects, Blender, or complex 3D tools.

## Core Job To Be Done

Help me turn a few static images into a polished animated spatial showcase that I can export and share.

## Supported Production Rigs

Maintain six complete working motion rigs:

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

### Grid Wall

A six-tile architectural wall with ratio-aware grid geometry, drift, and focal rhythm.

### Focus Deck

A five-card presentation system with one dominant hero and four subordinate supports.

### Stack Flow

A six-card layered queue with horizontal, vertical, or diagonal stack axes.

### Wave Path

A six-card open curved path with controllable wave, tilt, perspective, and tangent rotation.

## MVP User Flow

1. User opens the local app and understands the value proposition.
2. User adds local images, tries a guided showcase, or browses motion systems.
3. User chooses a motion system and curated preset.
4. User modifies movement, layout, appearance, or output settings.
5. User plays, pauses, replays, or scrubs through one loop.
6. User exports WebM locally or explicitly chooses a PNG still.
7. If media or capability requirements are not met, the product provides a direct recovery action.

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

A compact current-rig summary, access to the visual rig library, active rig presets, and the active media sequence. Only complete registered rigs can be selected.

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

The MVP is successful if a user can add images, choose a suitable motion system, produce a polished animation, and export a usable WebM from their browser.

For six-rig alpha presentation readiness, a first-time viewer must also be able to identify the structural difference between all six systems from the library, understand which two are recommended starting points, retain context after entering the editor, and complete a representative export without encountering placeholder navigation, hidden state, page overflow, or ambiguous completion metadata.

For controlled external alpha readiness, a new tester should understand the product within ten seconds and create one useful motion output in under five minutes. Recovery paths must prevent empty media and export capability states from becoming dead ends, and the in-app guide must make local-media lifetime and browser-dependent WebM support explicit.

For visual-identity readiness, mint must not remain in application chrome or interaction states. Violet state changes must retain text, icons, borders, checked state, pressed state, or announcements so meaning never depends on color alone. The stage and user-authored output remain visually dominant over the interface.
