# Hoppy Visual Identity

## Direction

Hoppy is a premium creative motion instrument. Its promise is “Turn static visuals into motion.” The moving composition remains the hero; application chrome stays precise, quiet, and predominantly monochrome.

The working balance is 95% neutral and 5% Motion Spectrum. The spectrum represents image → motion → transformation. It is a functional signal, not ambient decoration, and is original to Hoppy rather than a reproduction of another product or logo.

Hoppy is approachable but visually professional. Do not use mascot imagery, playful rounded typography, bouncing logo animation, childish language, or rabbit symbolism unless a future brand phase explicitly approves it.

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
| Spectrum start | `#8B5CFF` | First gradient stop only |
| Spectrum mid | `#5B8CFF` | 45% gradient stop only |
| Spectrum end / Focus Cyan | `#38D9FF` | Final gradient stop and solid keyboard focus |
| Accessible Spectrum Text | `#A9B8FF` | Small accent labels on dark surfaces |
| Pressed | `#6325E8` | Pressed primary creation actions |

Canonical gradient:

```css
linear-gradient(135deg, #8B5CFF 0%, #5B8CFF 45%, #38D9FF 100%)
```

The start color is never used as a standalone purple identity. Focus Cyan and Accessible Spectrum Text are the only normal solid accent colors in application chrome.

## Contrast Contract

- Accessible Spectrum Text has 9.80:1 contrast on `#121212` and 9.29:1 on `#181818`.
- Focus Cyan has 11.96:1 contrast on `#080808` and 10.60:1 on `#181818` for highly visible non-text focus indication.
- The raw bright spectrum does not provide reliable white-text contrast at every stop. Primary CTA surfaces therefore place a uniform dark contrast layer over the canonical spectrum: 45% for default and 42% for hover.
- White text has at least 5.13:1 contrast across the default CTA and 4.70:1 across hover. White on the pressed token has 7.09:1.
- `#6E6E73` has only 3.69:1 contrast against `#121212`; reserve it for disabled or non-essential decoration, never readable body copy.

## Spectrum Usage

Use the gradient only for:

- the one primary creation action at a decision point;
- active motion tracks and progress;
- selected creation borders and small active indicators;
- restrained Featured and current-motion-system markers;
- preview-only selected-card outlines in the Canvas renderer.

Do not use the gradient:

- as a page, panel, card, preview, or content background;
- behind headings or body copy;
- as a decorative wash, banner, divider system, or brand wallpaper;
- for every button, border, label, or icon;
- as glow, bloom, haze, spotlight, animated gradient, or neon treatment.

User media, authored demo artwork, selected background colors, and preset output palettes are content rather than application chrome. They keep their authored colors and are not recolored to match the identity.

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

Prefer spacing and a neutral surface change before adding a border. Use `#2A2A2A` for structural separation and `#3A3A3A` only when a control boundary must remain explicit.

## Buttons

- Primary creation actions retain the existing pill shape and use the contrast-safe spectrum surface with white 600-weight text.
- Hover reveals a slightly brighter contrast-safe spectrum. Pressed uses `#6325E8` and the existing one-pixel press movement.
- Focus uses a 2px solid cyan outline with offset; it never uses glow.
- Disabled primary actions use a neutral grey surface and muted label, not a low-opacity spectrum.
- Secondary actions remain neutral and outlined only when a boundary is necessary.
- Only one action carries the spectrum at each local decision point. Gallery Use motion actions stay neutral because several appear together; selection becomes the spectrum moment.

## Component States

- Active and selected cards: 1px spectrum border, neutral blue-black surface, and persistent Active, Applied, or Selected text plus semantic state.
- Tabs: accessible spectrum text plus a 2px spectrum indicator and `aria-selected`.
- Range controls: neutral track, value-aware spectrum active portion, white thumb, and cyan keyboard focus.
- Toggles: neutral when off, spectrum track when on, white thumb, label, and native checked state.
- Focus: solid cyan outline; never gradient-only and never removed without replacement.
- Modified: retain the Modified label; color is supplementary.
- Disabled: neutral surface and muted text with native disabled semantics.
- Success: use a check icon and completion copy with a restrained spectrum indicator. Do not imitate generic green success styling.
- Error and warning: preserve distinct red and amber text/icon treatments.

## Gallery

- Real motion previews remain the largest element on every card.
- Show family, name, concise outcome, readiness, media requirement, and action.
- Featured uses a small spectrum dot and low-intensity spectrum border.
- Active uses a spectrum border, neutral tint, Active label, disabled current action, and `aria-current`.
- Use motion actions remain neutral so six cards do not create competing gradient buttons.
- Do not add marketplace pricing, extra badges, decorative preview gradients, or technical tag density.

## Export Presentation

Export is the creation moment. The top-bar Export command and the sheet’s current creation action carry the CTA spectrum. The neutral sheet keeps capability, format, resolution, FPS, ratio, duration, background, filename, cancellation, PNG acknowledgement, and fallback behavior unchanged.

Running export uses a neutral container with spectrum progress and phase tracks. Completion uses a restrained contrast-safe spectrum mark, explicit local-save copy, and detailed output metadata. Warning, error, PNG, and browser capability states retain their own non-green semantics.

## Shadows And Depth

Allowed:

- renderer-owned shadows attached directly to moving media cards;
- one restrained shadow on blocking dialogs, gallery, switch confirmation, and export sheet.

Not allowed:

- button shadows;
- panel, transport, notice, or library-card shadows;
- text shadows;
- spectrum glow around selections, progress, sliders, or completion marks;
- canvas spotlight, haze, bloom, or automatic center illumination.

## Do / Don’t

Do:

- let the stage and authored content carry visual richness;
- use one spectrum primary action per decision point;
- pair color with labels, icons, borders, checked state, or announcements;
- keep neutral space around dense controls;
- use internal scrolling rather than expanding the editor document.

Don’t:

- add a spectrum gradient to make a neutral surface feel “premium”;
- tint every card, panel, or heading;
- use glow as focus, selection, success, or depth;
- replace readable secondary text with the disabled muted token;
- recolor user media or renderer output to match the application UI.
