# MotionKit Spatial

MotionKit Spatial is a private local browser prototype for creating animated spatial motion from screenshots. The current MVP focuses on one motion rig: Orbit Carousel.

Users can upload four images or load generated demo cards, preview a smooth Canvas 2D orbit animation, adjust basic rig settings, and export a local WebM file.

The Phase 8 editor opens with a focused first-run screen, then moves into a fixed creative workspace with top-level playback and export actions, media navigation on the left, a dominant canvas stage, and a contextual inspector on the right.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Deploy To Vercel

Deploy this project as a Vite app on Vercel.

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

The app is static and browser-only. Uploaded images are processed locally in the user's browser and are not saved or uploaded by MotionKit Spatial.

## Current Features

- React + Vite + TypeScript local app
- Canvas 2D Orbit Carousel renderer
- Generated in-app demo cards for first-use testing
- Four local media slots with upload, replace, clear, and clear-all
- Premium dark editor shell with grouped controls
- First-run demo or four-image upload flow
- Compact editor top bar with synchronized playback, reset, and export actions
- Navigation-focused media sidebar and collapsible rig inspector
- Live preview with play/pause
- Frame ratios: 1:1, 16:9, 9:16
- Rig controls for duration, spread, depth fade, card size, corner radius, and direction
- Card shape control: Rectangle, Square, Circle, Star
- Background modes: Transparent, Solid, Gradient
- Local WebM export with PNG snapshot fallback
- Preview-only frame guide so exports render as clean compositions

## Current Limitations

- WebM only
- MP4 not available yet
- No backend, auth, database, or cloud storage
- No project saving
- No timeline
- No advanced export settings
- Transparent WebM playback may vary by browser
- Local prototype only
