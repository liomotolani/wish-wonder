---
trigger: glob
globs: "app/**/*.tsx"
description: "Accessibility requirements for every screen and component"
---

# Accessibility

- Meet WCAG 2.1 AA. Text contrast is at least 4.5:1, or 3:1 for large text (24px, or about 18.7px bold). Check gold and muted text on both light and dark backgrounds.
- Tap targets are at least 44 by 44px.
- Use real elements: `<button>` for actions, `<a href>` for navigation, `<input>` with a `<label>` for every field. Never put `onClick` on a `div` or `span`.
- Icon-only buttons have an `aria-label`. Decorative SVGs have `aria-hidden="true"`.
- Each mystery box has a label that says its state, for example "Number 4, Taken".
- Everything works with a keyboard, with a visible focus ring.
- Respect `prefers-reduced-motion`: replace the reveal animation, confetti and snowfall with a simple fade.
- Announce results with a live region: claim confirmed, "Already picked", errors.
- Bottom sheets and dialogs trap focus, close on Escape, and return focus to the button that opened them.
- Never use colour alone to show state. Taken and Peeked boxes also have a text label.
