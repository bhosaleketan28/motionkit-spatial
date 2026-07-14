# MotionKit Spatial Visual Identity

## Direction

MotionKit Spatial is a premium motion design instrument. The interface should feel cinematic, precise, and quiet enough for the moving composition to remain the hero.

The working balance is 95% neutral and 5% accent. Violet communicates action and state; it is not ambient decoration.

## Color Tokens

| Role | Value | Usage |
| --- | --- | --- |
| Background | `#080808` | Application and first-run foundation |
| Primary surface | `#121212` | Panels, bars, and dialogs |
| Elevated surface | `#181818` | Controls, cards, grouped content |
| Derived hover surface | `#222222` | Neutral hover feedback |
| Border | `#2A2A2A` | Structural separators |
| Strong border | `#3A3A3A` | Inputs and blocking surfaces |
| Primary text | `#F5F5F7` | Headings and important values |
| Secondary text | `#A1A1A6` | Body and control labels |
| Readable tertiary text | `#85858B` | Metadata and supporting copy |
| Muted / disabled | `#6E6E73` | Disabled labels and non-essential decoration only |
| MotionKit Violet | `#7A3DFF` | Primary fills, selected borders, progress, focus |
| Violet hover | `#8B5CFF` | Hovered primary actions |
| Violet pressed | `#6325E8` | Pressed primary actions |
| Violet soft | `rgba(122, 61, 255, 0.12)` | Selected surface tint |
| Violet focus | `rgba(122, 61, 255, 0.35)` | Reserved focus support tint |
| Accessible violet text | `#A98BFF` | Small accent labels on dark surfaces |

White text on MotionKit Violet has a 5.33:1 contrast ratio. MotionKit Violet has more than 3:1 contrast against the core dark surfaces for non-text focus and selection indicators. `#6E6E73` does not meet normal-text AA against the primary surface, so it must not be used for readable body or metadata copy.

## Accent Rules

Use violet for:

- the one primary creation action in a local context;
- selected tabs, media, presets, segmented options, and the active motion system;
- keyboard focus rings;
- range controls, toggles, transport progress, and export progress;
- compact status icons when adjacent text identifies the state.

Do not use violet for:

- large decorative fields or ambient page washes;
- purple gradients, glow, bloom, haze, or spotlight effects;
- every border, label, or icon in a panel;
- user media, chosen backgrounds, or preset output palettes.

## Typography

- Display and body stack: Avenir Next, then Helvetica Neue and system sans-serif fallbacks.
- Large headings: 600 weight with restrained negative tracking.
- Body copy: 400 weight with comfortable line spacing.
- Strong labels and buttons: 600 weight.
- Use title case for labels and metadata. Avoid dense uppercase UI copy.
- Do not shrink meaningful metadata below 11px; inspector and export working labels remain 12–14px.
- Numeric transport, time, dimensions, and output values retain tabular numerals where comparison matters.

## Surface Hierarchy

1. `#080808` application foundation.
2. `#121212` primary rails, bars, and blocking surfaces.
3. `#181818` elevated controls, cards, and grouped content.
4. `#222222` temporary neutral hover surface.

Prefer a surface change and spacing before adding a border. Use `#2A2A2A` for structural separation and `#3A3A3A` only when a control boundary must remain explicit.

## Buttons

- Primary actions use a pill shape, MotionKit Violet fill, and white 600-weight text.
- Hover uses `#8B5CFF`; pressed uses `#6325E8`.
- Disabled primary actions use a neutral grey surface and muted label, not low-opacity violet.
- Secondary actions remain neutral and outlined only when a boundary is necessary.
- Do not place multiple violet primary actions next to each other unless they are mutually exclusive selections.
- Labels remain explicit: Add your images, Use motion, Create WebM, and Close.

## Component States

- Active and selected: violet border or indicator plus a soft tint and a persistent text or icon label.
- Focus: 2px violet outline with offset; never remove interactive focus without a replacement.
- Modified: retain the Modified label; color is supplementary.
- Applied: retain the Applied label and selected radio semantics.
- Disabled: neutral surface and muted text with native disabled semantics.
- Success: use a check icon and completion copy. Violet may identify the product state, but it must not imitate generic green success styling.
- Error and warning: preserve their distinct red and amber text/icon treatments.

## Gallery

- Real motion preview remains the largest element on every card.
- Show family, name, concise outcome, readiness, media requirement, and action.
- Featured uses a small violet badge and subtle border only.
- Active uses a violet border, soft tint, Active label, and `aria-current`.
- Do not add marketplace pricing, extra badges, decorative preview dots, or technical tag density.

## Shadows And Depth

Allowed:

- renderer-owned shadows attached directly to moving media cards;
- one restrained shadow on blocking dialogs, gallery, switch confirmation, and export sheet.

Not allowed:

- button shadows;
- panel, transport, notice, or library-card shadows;
- text shadows;
- violet glow around selections, progress, sliders, or completion marks;
- canvas spotlight, haze, bloom, or automatic center illumination.

## Export Presentation

Export is framed as creating a final output. The top-bar command remains Export for recognition, while the sheet uses Final output, Create WebM/Create PNG, creating-progress language, and a locally saved completion moment. Format explanations, capability checks, cancellation, encoding, PNG acknowledgement, and fallback behavior remain unchanged.

## Do / Don’t

Do:

- let the stage and authored content carry visual richness;
- use one violet primary action per decision point;
- pair color with labels, icons, borders, checked state, or announcements;
- keep neutral space around dense controls;
- use internal scrolling rather than expanding the editor document.

Don’t:

- add a purple gradient to make a neutral surface feel “premium”;
- tint every card, panel, or heading violet;
- use glow as focus, selection, success, or depth;
- replace readable secondary text with the disabled muted token;
- recolor user media or renderer output to match the application UI.
