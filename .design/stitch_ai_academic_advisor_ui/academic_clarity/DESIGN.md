---
name: Academic Clarity
colors:
  surface: '#f3fbfa'
  surface-dim: '#d3dcdb'
  surface-bright: '#f3fbfa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf5f5'
  surface-container: '#e7efef'
  surface-container-high: '#e2eae9'
  surface-container-highest: '#dce4e4'
  on-surface: '#151d1d'
  on-surface-variant: '#3d484e'
  inverse-surface: '#2a3232'
  inverse-on-surface: '#eaf2f2'
  outline: '#6d797e'
  outline-variant: '#bdc8ce'
  surface-tint: '#006781'
  primary: '#006781'
  on-primary: '#ffffff'
  primary-container: '#15a9d1'
  on-primary-container: '#003948'
  inverse-primary: '#5bd4fe'
  secondary: '#576060'
  on-secondary: '#ffffff'
  secondary-container: '#d8e2e1'
  on-secondary-container: '#5b6464'
  tertiary: '#8c5000'
  on-tertiary: '#ffffff'
  tertiary-container: '#db892f'
  on-tertiary-container: '#4f2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9eaff'
  primary-fixed-dim: '#5bd4fe'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#dbe4e4'
  secondary-fixed-dim: '#bfc8c8'
  on-secondary-fixed: '#141d1d'
  on-secondary-fixed-variant: '#3f4948'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#f3fbfa'
  on-background: '#151d1d'
  surface-variant: '#dce4e4'
typography:
  welcome-text:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-main:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  ui-element:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  button-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  welcome-text-mobile:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  element-gap: 12px
  input-height: 40px
  max-content-width: 800px
---

## Brand & Style

The design system is built for an AI Academic Advisor, focusing on clarity, focus, and reduced cognitive load. The target audience includes students and educators who require immediate, distraction-free access to information. 

The design style is **High-Minimalism**. It rejects traditional depth cues like shadows and gradients in favor of a flat, structured aesthetic. By utilizing a specific palette of light cyan and high-contrast neutrals, the UI evokes a sense of "digital paper"—an environment that feels academic, organized, and intentional. The emotional response is one of calm efficiency and structural reliability.

## Colors

The color strategy relies on a specialized background tint to soften the workspace while maintaining high legibility. 

- **Primary Canvas**: The `#B2FFFF` background acts as the foundational layer, providing a distinct academic atmosphere that differs from standard white-label SaaS products.
- **Surface & Inputs**: Pure `#FFFFFF` is used for interactive containers and input fields to create a stark, flat contrast against the tinted background without the need for shadows.
- **Typography**: Two tiers of gray ensure a clear hierarchy. `#1D2626` is reserved for primary headings and user input, while `#444C4C` handles secondary metadata and UI labels.
- **Action Accents**: Sky Blue (`#15A9D1`) is used sparingly for brand-specific icons, while the final execution action (Send) utilizes a high-contrast Black (`#080808`) for maximum click-intent clarity.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian qualities. The typographic scale is intentionally polarized: large, bold weights for welcome messages to provide a strong "home" anchor, and very small, precise 11px weights for utility elements to maximize the surrounding whitespace.

- **Welcome Text**: Set at 20px Bold for desktop, scaling slightly down for mobile. This is the only "expressive" element.
- **Interactive Elements**: Inputs, buttons, and labels use an 11px regular/medium scale. This creates a technical, precise feel reminiscent of architectural diagrams or academic journals.
- **Readability**: Despite the small size of UI elements, legibility is maintained through increased letter spacing on smaller tokens and the high contrast between `#1D2626` and the white surface.

## Layout & Spacing

The layout philosophy follows a **Fixed Center-Column** model for the chat interface to ensure focus.

- **The Void**: Use heavy whitespace. Margins between disparate functional groups should be generous (32px+), while internal component spacing remains tight (12px) to signify relationship.
- **Grid**: A 12-column grid is used for the dashboard, but the core chat interaction is confined to a central 8-column span on desktop to prevent eye strain.
- **Mobile**: On mobile devices, side margins reduce to 16px. The input bar remains pinned to the bottom with a 12px safe area from the screen edge.
- **Rhythm**: All spacing is derived from a 4px baseline grid to maintain alignment across the small-scale typography.

## Elevation & Depth

This design system explicitly omits shadows and blurs. Depth is communicated through **Color Blocking** and **Layering**.

1.  **Level 0 (Background)**: The `#B2FFFF` canvas.
2.  **Level 1 (Interaction)**: White (`#FFFFFF`) surfaces placed directly on the canvas. Because there are no shadows, these elements must be separated from the background by their color difference alone.
3.  **Level 2 (Overlays)**: Modals or tooltips use a thin 1px border of `#1D2626` at 10% opacity to define edges against other white surfaces, rather than using a shadow.

Visual hierarchy is achieved by the "pop" of white against the cyan tint.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness. This subtle rounding prevents the UI from feeling "sharp" or aggressive, aligning with the "Advisor" persona, while remaining professional and structured.

- **Inputs & Buttons**: Use a consistent 4px (0.25rem) radius.
- **Cards/Containers**: Large containers may use up to 8px (0.5rem) to distinguish them from smaller UI widgets.
- **Icons**: Icons should follow a linear, 2px stroke weight to match the precision of the 11px typography.

## Components

- **Input Fields**: Must be solid `#FFFFFF` with no border. Placeholder text (`#999999`) uses the 11px typography token. Vertical padding is 12px.
- **Action Buttons**: Solid `#FFFFFF` backgrounds. Text is 11px Bold/Semi-bold `#1D2626`. Use a 1px solid stroke only if the button needs to sit on a white surface; otherwise, let the white-on-cyan contrast define the shape.
- **Chat Bubbles**: Unlike traditional chat apps, user messages and AI responses are distinguished by alignment and typography rather than contrasting bubble colors. All bubbles are white.
- **Icons**: The paper plane icon (`#15A9D1`) indicates "Prepare/Action," while the "Send" trigger icon is a stark `#080808`.
- **Chips/Suggestions**: Small white pills with 11px labels used for quick-reply academic prompts. These should be laid out in a flex-wrap container with 8px spacing.
- **Scrollbars**: Minimalist. Use a 4px wide track, `#1D2626` at 10% opacity, with no arrows.