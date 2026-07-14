# Six-Rig Presentation QA

Phase 13.1 defines the presentation baseline for wider alpha testing and short investor walkthroughs. It evaluates the actual production renderers and existing workflows; it does not introduce new motion geometry, settings, presets, export formats, or product identity.

## Library Baseline

Stable order:

1. Orbit Carousel — Featured
2. Grid Wall — Featured
3. Focus Deck
4. Film Strip
5. Wave Path
6. Stack Flow

Featured is limited to two rigs and signals recommended starting points only. Every card must also show its family, Production status, short outcome-led description, media/ratio metadata, and a visible Use rig or Active action. State and focus cannot rely on mint color alone.

## Preview Quality Criteria

- Run the actual production renderer through its isolated preview recipe.
- Use consistent 16:9 card framing and contain the complete composition.
- Reveal the defining structure within the first static frame and through one loop.
- Keep preview settings and generated media independent from workspace state.
- Do not add glow, haze, spotlight, or preview-only effects that misrepresent output.
- Use the shared visibility-aware scheduler; no per-card React animation state.
- Render a labeled static frame when reduced motion is requested.

| Rig | Required read | Phase 13.1 result |
| --- | --- | --- |
| Orbit Carousel | Circular motion with clear front/back depth | Balanced spread and smaller cards reveal the orbit |
| Grid Wall | Complete modular field with moving focus | All six cells remain legible with stronger focal weight |
| Focus Deck | One dominant hero and subordinate supports | Hero remains primary while support frames stay visible |
| Film Strip | Continuous ordered band | Smaller frames and gap expose the stream structure |
| Wave Path | Open curve with tangent-led motion | Wider path and amplitude make the authored curve obvious |
| Stack Flow | Layered queue advancing through depth | Compact framing exposes the pile and depth sequence |

## Demo Quality Review

All demos are original, locally generated, and renderer-independent: Luma Field, Atlas System, Forma One, Northline Editorial, Current Studio, and Mono Editions. Each set has a coherent art direction, enough contrast for card crops, no copied product branding, and content that remains credible across supported ratios. Demo load must populate the active rig's exact slot contract and collapse Media into its compact populated state.

## Preset Review Matrix

| Rig | Presets | Review result |
| --- | --- | --- |
| Orbit Carousel | Cinematic, Clean Studio, Launch Glow, Minimal Light | Distinct scale, depth, pacing, and background directions |
| Grid Wall | Editorial Wall, Product Matrix, Social Mosaic, Flat Grid | Distinct focus rhythm, grid density, drift, and surface treatment |
| Focus Deck | Product Hero, Case Study, Campaign Focus, Clean Presentation | Distinct hero hierarchy, support framing, pace, and background |
| Film Strip | Editorial Flow, Cinematic Sweep, Social Stream, Flat Gallery | Distinct width, gap, perspective, tilt, speed, and edge emphasis |
| Wave Path | Cinematic Wave, Editorial Ribbon, Social Flow, Flat Path | Distinct amplitude, frequency, tangent motion, pace, and flat baseline |
| Stack Flow | Layered Deck, Editorial Stack, Social Cards, Minimal Pile | Distinct axis, overlap, depth, pacing, and surface treatment |

Applied and Modified must be announced in text. Reapplying a preset must preserve media and every property the preset does not own. Return to rig defaults remains separate.

## Accessibility Checklist

- First-run, gallery, workspace, overflow confirmation, export review, and completion expose accurate accessible names.
- Blocking dialogs make background UI inert, contain keyboard focus, close with Escape where allowed, and return focus to the opening control.
- Featured, Production, Active, reduced-motion, success, warning, and error states are not color-only.
- Inspector controls retain visible labels, distinct slider/precise-entry names, units, reset labels, and error associations.
- Collapsed inspector sections stay collapsed while other settings update.
- Mobile Media and Inspector drawers are mutually exclusive and return focus to their triggers.
- Reduced-motion mode pauses autoplay, minimizes non-essential transitions, and keeps manual playback available.
- At 200% zoom, internal panel scrolling remains available and no page-level horizontal overflow appears.

## Investor Demo Walkthrough

1. Start on first run and point out the task flow plus six production systems.
2. Open Browse rigs. Show the two Featured starting points and the structural difference across all six previews.
3. Select Grid Wall and load Atlas System. Show the compact Media sequence and selected-slot feedback.
4. Apply Product Matrix, change one precision value, and show the Applied-to-Modified transition.
5. Collapse Layout, edit Motion, and demonstrate that disclosure state remains stable.
6. Switch to Focus Deck, cancel overflow removal once, then confirm it to show safe media preservation.
7. Use Space, arrow stepping, Shift+arrow, 0, and Shift+F to demonstrate keyboard inspection.
8. Open export, compare WebM and PNG context, cancel one WebM attempt, retry, and show detailed completion metadata.
9. Finish in the rig library at tablet or mobile width to show stage-first responsiveness and drawer recovery.

## Responsive Verification

| Viewport | Expected architecture | Phase 13.1 result |
| --- | --- | --- |
| 1440×900 | Fixed editor with both desktop rails and dominant stage | Pass |
| 1280×720 | Compact desktop rails, visible canvas and transport | Pass |
| 960×800 | Stage-first layout with hidden rails and drawer triggers | Pass |
| 768×1024 | Full-height stage, internal controls, no document stack | Pass |
| 390×844 | Mobile toolbar, full-width stage, persistent scrubber, bottom drawers | Pass |

The tested document width matched the viewport at every size. Media drawer Escape recovery restored focus to Show media panel. Gallery open/close cycles did not leave stale preview schedulers or new console errors.

Direct 200% browser zoom emulation was not available in the automated browser, so 200% zoom remains a manual alpha check.

## Export Confidence

Focus Deck and Wave Path were exercised through WebM and PNG. Wave Path also covered active cancellation and retry. PNG hid video-only controls, required explicit still-frame acknowledgement, and completed with Still frame and Not applicable FPS metadata. WebM completion reported duration and FPS. Both formats reported rig, dimensions, background, loaded media, filename, and file size.

## Regression Guardrails

- Keep registry order and Featured validation centralized.
- Keep preview recipes isolated from workspace settings and exports.
- Preserve the renderer's no-automatic-glow background behavior.
- Preserve selected-card preview highlighting as preview-only.
- Re-run all five target viewports, WebM/PNG on at least three rigs, cancellation/retry, reduced motion, 200% zoom, and browser-console checks before widening the production rig set.
