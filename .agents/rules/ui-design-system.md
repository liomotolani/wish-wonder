---
trigger: glob
globs: "app/**/*.tsx, app/**/*.css, tailwind.config.*"
description: "Midnight Pine visual design tokens and layout conventions"
---

# UI design system: Midnight Pine

- Use the Tailwind theme tokens, never raw hex values in components:
  - `pine-900` #0B231B (dark backgrounds), `pine-700` #14402F, `pine-100` #E4EEE8
  - `cranberry` #D23A4E (primary actions), `cranberry-ink` #B42A3E (red text)
  - `gold` #E9C46A (highlights, ribbons), `gold-100` #FAF0D3
  - `snow` #F6F4EF (light backgrounds), `ink` #10201A (text), `muted` #5B6B63
- Font: Plus Jakarta Sans. Headings weight 800 with tight letter spacing. A display serif for big headings is still being considered; don't add one unless asked.
- Gold is for fills, ribbons and text on dark backgrounds only. Gold text on light backgrounds fails contrast.
- Radii: 16 to 22px for cards, fully rounded pill buttons.
- Dark, snowy screens: Welcome, onboarding, Picker, Reveal. Light screens open with the snowy pine header band.
- Reuse the shared components for the mystery tile (closed, Peeked, Taken), bauble avatar, header band, tab bar and bottom sheet. Don't restyle them per page.
- Build mobile-first at 390px, then add the laptop layout with breakpoints. Match the mockups in `docs/mockups/`.
- Phone: bottom tab bar. Laptop: top navigation bar.
- No emoji in the UI. Icons are inline stroke SVGs.
