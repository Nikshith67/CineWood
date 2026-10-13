---
name: Cinematic Dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#55e074'
  on-tertiary: '#003913'
  tertiary-container: '#008536'
  on-tertiary-container: '#ecffe8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#74fe8e'
  tertiary-fixed-dim: '#55e074'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#00531f'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes an immersive, theater-grade digital streaming experience. Visual priority is dictated entirely by content: UI chrome recedes into high-depth near-blacks to let vibrant video keys, dynamic backdrops, and cinematic photography drive engagement. The emotional tone is premium, focused, high-contrast, and immediate.

The visual style synthesizes **Modern Minimalist Screen Design** with targeted **Glassmorphism**. Key structural elements include:
- Uncompromising edge-to-edge canvas execution that bleeds photography directly beneath navigation headers and control layers.
- Restrained, purposeful placement of signature high-chroma red to convey urgency, system states, and critical actions without visually cluttering media artwork.
- Precision hierarchy built through high-contrast typography, frosted glass overlay planes, and subtle surface elevation tiers.

## Colors

The palette is engineered specifically for dark environments and HDR-grade visual impact, balancing high contrast against pure blacks to minimize light-bleed and direct user attention to rich media.

### Palette Roles
- **Primary (`#E50914`)**: Used exclusively for brand identity anchors, primary playback commitments (e.g., featured calls-to-action), live event indicators, media scrubber progress bars, and high-priority active indicators.
- **Secondary (`#FFFFFF`)**: High-contrast white reserved for prominent action surfaces (e.g., standard "Play" button fills), hero headlines, and active navigation tab labels.
- **Tertiary (`#46D369`)**: Cinematic green strictly reserved for positive metadata metrics such as match ratings, new season announcements, and system success notifications.
- **Neutrals**:
  - `Surface Void` (`#0B0B0B`): Base viewport canvas, ambient video letterboxing, and extreme bottom scrim layers.
  - `Surface Base` (`#141414`): Primary layout container, structural cards, and modal backdrops.
  - `Surface Layer` (`#1F1F1F`): Elevated dropdowns, secondary control buttons, and card expansion panels.
  - `Text Primary` (`#FFFFFF`): Title typography, primary button labels on dark fills, and focused icons.
  - `Text Muted` (`#B3B3B3`): Cast credits, synopsis bodies, row subtitles, and secondary control icons.
  - `Text Dim` (`#808080`): Tertiary metadata, timestamps, tags, and copyright/footer disclosures.
  - `Glass Overlay` (`rgba(40, 40, 40, 0.7)`): Persistent header bars, preview cards, and pill badges layered directly over high-contrast imagery.

## Typography

The type system blends the structured, geometric attitude of Space Grotesk for prominent title treatments with the readability of Plus Jakarta Sans across content descriptors and user interfaces.

- **Hero & Headline Levels**: Space Grotesk delivers an architectural, cinematic impact. Letter-spacing on `display-hero` and `headline-lg` should be slightly tightened (-0.02em) to maintain visual density on wide-ratio screens.
- **Body & Editorial**: Plus Jakarta Sans provides clear readability over variable dark and semi-translucent backdrops.
- **Labels & Badges**: Set in heavy weights with wide, neutral tracking (+0.03em to +0.05em on badges) to guarantee rapid legibility at miniature scale over complex media backdrops.

## Layout & Spacing

The viewport layout centers around horizontal browsing ribbons, a billboard hero container, and fluid modular grids.

### Canvas & Grids
- **Desktop (>= 1280px)**: 12-column fluid grid, `margin`: 3.5rem (56px) outer side margins, `gutter`: 0.75rem (12px) between card units. Content carousels break outside margins, allowing peek hints of subsequent elements.
- **Tablet (768px - 1279px)**: 8-column grid, 2rem side margins, 0.75rem gutters. Horizontal card rails dynamically slide on touch/scroll.
- **Mobile (< 768px)**: 4-column grid, 1rem side margins, 0.5rem gutters. Billboard unit shifts to a portrait 3:4 or 9:16 aspect ratio.

### Spatial Rhythm
Component padding uses a consistent 4px baseline rhythm. Interactive media tiles use `space-xs` and `space-sm` for tight badge clusters, while expanded preview modals use `space-lg` to `space-xl` to prevent dense metadata from crowding playback controls.

## Elevation & Depth

Visual depth is achieved through deliberate surface stacking, gradient light traps (scrims), and glassmorphism rather than muddy drop shadows.

### Atmospheric Scrims
- **Hero Scrim**: Vertical linear gradient (`rgba(11,11,11,0) 0%`, `rgba(11,11,11,0.6) 70%`, `#0B0B0B 100%`) applied across the bottom 40% of hero video/imagery to ground typography.
- **Header Scrim**: Vertical linear gradient (`rgba(11,11,11,0.9) 0%`, `rgba(11,11,11,0.4) 60%`, `transparent 100%`) pinning the main navigation securely above dynamic video.

### Surface Tiers & Frosted Glass
- **Level 0 (Canvas)**: `#0B0B0B` base.
- **Level 1 (Card & Content Rails)**: `#141414` base or 16:9 thumbnail surfaces.
- **Level 2 (Glass Overlays & Badges)**: `rgba(40, 40, 40, 0.7)` with `backdrop-filter: blur(16px)` and a crisp 1px ghost border (`rgba(255, 255, 255, 0.12)`).
- **Level 3 (Interactive Card Hover State)**: Transformed card scale (1.15x - 1.25x), elevated above adjacent content with a deep ambient shadow: `0 16px 36px rgba(0, 0, 0, 0.85)`.
- **Level 4 (Modals & Full Details Dialogs)**: `#141414` backed by full-screen backdrop dimmers (`rgba(0, 0, 0, 0.8)` with `backdrop-filter: blur(8px)`).

## Shapes

The design system uses a predominantly tight, disciplined geometry with selective pill rounding for tactical user interfaces:

- **Soft Base (`roundedness: 1`, 4px / 0.25rem)**: Standard image cards, content posters, input fields, and video viewport borders maintain crisp corners that evoke physical widescreen hardware.
- **Elevated Modals & Floating Shelves (8px / 0.5rem)**: Details panes, drawer menus, and popovers use `rounded-lg` for approachable containment.
- **Pill Badges & Circular Buttons (Full Radius, 9999px)**: Media format indicators (4K, HDR, Spatial Audio), Top 10 chips, rating markers, and circular icon controls (Add to List, Thumbs Up/Down, Volume Mute) utilize full pill/circle geometry to contrast against rectilinear video frames.

## Components

### Buttons
- **Primary Action (Play)**: Solid white background (`#FFFFFF`) with deep black text (`#0B0B0B`). Rectangular with soft corners (`roundedness: 1`), bold label, prominent play SVG glyph. On hover: opacity 0.85.
- **Brand Action**: Pure vibrant red (`#E50914`) background with crisp white text (`#FFFFFF`). Used for high-conversion tasks (e.g., "Join Now", "Restart Membership", "Watch Live").
- **Secondary Action (More Info)**: Frosted glass fill (`rgba(109, 109, 110, 0.7)` or `rgba(40, 40, 40, 0.7)`), crisp white text (`#FFFFFF`), `backdrop-filter: blur(12px)`. On hover: `rgba(109, 109, 110, 0.4)`.
- **Icon Action**: Circular 40px/48px tap targets with 1px border (`rgba(255, 255, 255, 0.5)`), transparent fill, and white glyph. On hover: border white, fill `rgba(255, 255, 255, 0.1)`.

### Chips & Pill Badges
- **Technical Specs (4K Ultra HD, HDR, Dolby Atmos)**: Pill geometry with `label-badge` typography. Background `rgba(40, 40, 40, 0.7)`, border `1px solid rgba(255, 255, 255, 0.2)`, padding `2px 8px`, white text.
- **Top 10 Indicator**: Rectangular tag with bright red background (`#E50914`), white bold uppercase typography (`label-badge`), positioned on card corners or alongside titles.
- **Maturity Rating**: Crisp rectangular container with 1px border (`#808080`), subdued gray text (`#B3B3B3`), 2px padding.

### Media Cards & Dynamic Rail Hover
- **Default State**: 16:9 or 2:3 aspect ratio, subtle border radius (4px), overflow hidden, clean display without clutter.
- **Hover Expansion State**: Card scales upward (1.2x) from center origin with smooth 300ms cubic-bezier transition, elevating to Level 3. Displays auto-previewing looping video or high-res billboard, accompanied by a dynamic metadata panel beneath the media frame detailing match %, age rating, audio/video spec pills, and inline action buttons (Play, Add, Like).

### Input Fields & Search
- **Search Component**: Collapsed state displays a standalone white magnifying icon. Expanded state slides open a frosted input container (`rgba(0, 0, 0, 0.75)` with `1px solid #FFFFFF`), text set in `body-md` white, placeholder text `#808080`.
- **Form Controls**: Rich neutral inputs (`#1F1F1F`), top-aligned micro labels for floating form states, focused boundary in clean `#FFFFFF` or `#E50914` for form validation errors.

### Checkboxes & Switches
- **Toggles / Switches**: Track styled in `#333333`, transitioning to vibrant red (`#E50914`) when activated. Thumb is crisp white circular disk.
- **Checkboxes**: 18px square with 2px border radius. Unchecked: `1.5px solid #808080`. Checked: filled `#E50914` with a white checkmark icon.

### Scrubber Bar (Playback Progress)
- Height: 4px default, expanding to 8px on hover/scrub interaction.
- Track Background: `rgba(255, 255, 255, 0.2)`.
- Buffer Bar: `rgba(255, 255, 255, 0.4)`.
- Active Progress: Solid signature red (`#E50914`) with a floating circular handle indicator on scrub.