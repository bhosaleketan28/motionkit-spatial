# Rig Gallery

The rig gallery is the discovery and switching surface for motion systems. It opens from first run, the persistent workspace rig summary, the Create panel, and empty Media guidance.

## Content Order

- Production rigs appear first and are sourced only from the validated registry.
- Roadmap concepts appear second when present. Phase 13 has no roadmap cards because all four prior concepts are now production rigs.
- Family tabs are derived from populated production and roadmap entries; empty families are hidden.
- Each production card shows family, name, production status, concise description, media requirement, ratios, discovery tags, and Select or Active state.

## Preview Contract

Production cards render the actual rig renderer with a rig-owned preview recipe. Preview settings are isolated from the active workspace. Generated demo media is decoded and cached once per rig/version/media-count key.

One gallery-owned scheduler targets approximately 22 FPS. It draws only cards reported visible by Intersection Observer, stops when the gallery unmounts, suspends while the document is hidden, and does not set React state per frame. Reduced-motion mode renders the declared static progress frame without starting the scheduler.

## Interaction Rules

- The dialog traps focus, closes with Escape, and returns focus to the opening control or its rerendered replacement.
- Selecting a compatible rig closes the gallery after the switch succeeds.
- If shrinking would discard populated overflow slots, the confirmation dialog opens above the gallery.
- Cancelling overflow removal keeps the gallery open. Confirming completes the switch and closes it.
- Empty Cluster and Depth families remain hidden.

## Phase 13 Production Set

The gallery contains six selectable real-renderer cards in stable registry order: Orbit Carousel, Film Strip, Grid Wall, Focus Deck, Stack Flow, and Wave Path. Their populated family filters are Orbit, Stream, Grid, Focus, Stack, and Path. All six previews share the same visibility-aware scheduler and isolated decoded-media cache.

## Responsive Rules

The library uses three columns on wide desktop, two on laptop and tablet, and a full-width single-column sheet on mobile. The header and family filters remain available while the card area scrolls internally. Page-level horizontal overflow is not permitted.
