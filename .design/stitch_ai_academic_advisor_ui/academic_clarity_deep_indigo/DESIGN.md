---
name: Academic Clarity Deep Indigo
colors:
  surface: '#030e3d'
  surface-dim: '#030e3d'
  surface-bright: '#2c3665'
  surface-container-lowest: '#000836'
  surface-container-low: '#0c1745'
  surface-container: '#101c49'
  surface-container-high: '#1c2654'
  surface-container-highest: '#273260'
  on-surface: '#dde1ff'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#dde1ff'
  inverse-on-surface: '#232d5b'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#bdc2ff'
  on-secondary: '#1f2872'
  secondary-container: '#39428c'
  on-secondary-container: '#abb3ff'
  tertiary: '#ffffff'
  on-tertiary: '#1e2676'
  tertiary-container: '#e0e0ff'
  on-tertiary-container: '#555dad'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#dfe0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#040d5e'
  on-secondary-fixed-variant: '#37408a'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#030a62'
  on-tertiary-fixed-variant: '#363f8d'
  background: '#030e3d'
  on-background: '#dde1ff'
  surface-variant: '#273260'
typography:
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  button-text:
    fontFamily: Source Sans 3
    fontSize: 16px
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
  container-padding: 2.5rem
  stack-gap: 1.5rem
  input-gap: 0.5rem
  section-margin: 3rem
---

## Brand & Style
The brand personality is authoritative, focused, and scholarly, designed to instill confidence during the sensitive process of account recovery. This theme utilizes a high-contrast, professional aesthetic that blends traditional academic reliability with a modern, nocturnal palette. 

The style is **Minimalist / Corporate**, leaning into structured containers and clear information hierarchy. By utilizing deep indigo backgrounds for the primary interaction area, the design creates a focused "dark mode" experience within a larger light-themed application environment, ensuring the password recovery task feels distinct and secure.

## Colors
The color strategy employs a sophisticated "inverted" approach. The primary surface is a crisp, cool white (`#F8FCFD`), while the central focus—the password recovery card—is a deep, scholarly indigo (`#28317B`).

- **Primary Action**: Pure white (`#FFFFFF`) is reserved for the highest priority action to ensure maximum visibility against the indigo card.
- **Typography**: Text within the card is strictly white or light lavender (`#E8ECFF`) for optimal legibility. 
- **Back Navigation**: The "Back" link uses a slightly deeper indigo (`#222A79`) to anchor it to the navigation history without competing with the card's content.

## Typography
This design system uses a hybrid typographic scale. **Source Serif 4** is used for headlines to provide a sense of institutional authority and tradition. **Source Sans 3** is used for all functional elements, including body copy, labels, and inputs, to ensure clarity and high readability.

Large display type should be used sparingly, primarily for the "Forgot Password" title. All labels inside the indigo card should use the light lavender weight to maintain hierarchy without the harshness of pure white.

## Layout & Spacing
The layout follows a **Fixed Grid** model for the recovery card, centered both horizontally and vertically within the viewport. 

- **Card Layout**: The central indigo card has a maximum width of 480px on desktop to maintain a compact, focused feel.
- **Vertical Rhythm**: A strict 8px grid governs the spacing. 24px (1.5rem) separates major groups like the header and the form, while 8px (0.5rem) is used between labels and their respective input fields.
- **Mobile Adaptation**: On mobile devices, the card expands to fill the width of the screen with 24px side margins, and the headline scales down to `headline-lg-mobile`.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and subtle contrast rather than aggressive shadows. 

- **The Recovery Card**: Sits on the `#F8FCFD` surface with a very soft, diffused ambient shadow (10% opacity of the indigo color) to give it a slight lift.
- **Inputs**: Use a flat design with a single bottom-border (`#7E88BC`) to mimic traditional academic forms and stationery.
- **Buttons**: The primary white button is flat; its "elevation" is perceived through its stark color contrast against the dark card.

## Shapes
The shape language is **Soft** and professional. A subtle 4px (`0.25rem`) corner radius is applied to the main card and primary buttons. This creates a clean, modern look that remains serious and disciplined. 

Avoid fully rounded "pill" shapes, as they contradict the structured, academic nature of the design system. Hard edges (0px) are also avoided to ensure the interface feels approachable.

## Components
- **Primary Button**: Solid `#FFFFFF` background with `#28317B` text. Bold weight, centered text, 12px vertical padding.
- **Input Fields**: Transparent background with a 1px bottom stroke in `#7E88BC`. Placeholder text should use `#AEB5D9`. On focus, the stroke weight increases to 2px.
- **Labels**: Always positioned above the input, using `label-sm` in `#E8ECFF`.
- **Cards**: The main container uses the `#28317B` background with `rounded-lg` (8px) corners.
- **Back Link**: Displayed as a text link with a small chevron, using `#222A79`. It should be positioned outside/below the main indigo card to indicate a step back in the flow.
- **Feedback States**: Error messages should appear directly below the input line in a pale coral color to ensure visibility against the dark indigo background.