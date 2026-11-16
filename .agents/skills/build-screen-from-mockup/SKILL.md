---
name: build-screen-from-mockup
description: Use when building or restyling a page or component to match the phone and laptop mockups.
---

# Build a screen from the mockups

1. Find the screen in `docs/mockups/`. Each has a phone image and a laptop image (for example `phone-04-picker.png`, `laptop-04-picker.png`). Also check the matching state images (empty, error, Taken).
2. List what the screen is made of and mark which parts already exist in `app/_components/`. Build missing shared parts there first.
3. Build the phone layout first. Use real data from `lib/db/` via the page's Server Component, not hard-coded values.
4. Add the laptop layout and compare it with the laptop image: lists become grids, bottom sheets become centred dialogs.
5. Add every state the mockups show for this screen.
6. Check the screen in the browser at 390px, 768px and 1440px wide. Compare side by side with the mockup images and list any differences you left on purpose.
7. Run through the accessibility and copy rules for this screen before calling it done.
