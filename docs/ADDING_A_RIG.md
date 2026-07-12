# Adding A Production Rig

Registration is the final step, not the first. A new rig is production-ready only when it supplies a complete contract.

1. Define validated settings and defaults beside the rig.
2. Implement deterministic Canvas rendering from frame, progress, settings, slot images, and slot count.
3. Define slot labels, accepted media, item limits, preferred dimensions, supported ratios, export requirements, and capabilities.
4. Define declarative inspector controls and exactly four compatible presets with explicit property ownership.
5. Create rig-owned demo media with exactly the declared slot count.
6. Choose one family from `RIG_FAMILIES`, add concise slug tags, set production maturity, and write gallery and accessibility descriptions.
7. Add a preview recipe using the real renderer, isolated default-derived settings, a supported ratio, duration, media count, and a useful static progress frame.
8. Register the complete definition only in `src/rigs/registry.ts`.
9. Verify the renderer at progress 0, 0.25, 0.5, 0.75, and immediately before 1; then verify startup validation, safe fallback, partial and full media, switching in both directions, presets, transport, all ratios and backgrounds, WebM, PNG, session restoration, reduced motion, focus, and responsive layouts.

Do not register a placeholder. An incomplete concept belongs in the limited roadmap data only when it has honest unavailable status and no selectable behavior.
