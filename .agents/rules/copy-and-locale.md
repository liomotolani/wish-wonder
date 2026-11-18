---
trigger: always_on
description: "Wording, spelling and currency rules for anything users read"
---

# Copy and locale

- British English: "colour", "organiser", "favourite", "personalise".
- Currency is GBP. Format pence with one shared helper using `Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })`, setting `minimumFractionDigits: 0` when the amount is whole pounds, so it shows £95, not £95.00.
- Dates use the `en-GB` format, for example 25 December 2026.
- Tone: warm, festive, short. Write as you'd talk to a grandparent. No jargon such as "token", "session" or "invalid".
- Use the product's own terms consistently:
  - **Reveal** or **peek**: opening a number. It never reserves anything.
  - **Claim**: "I'll Buy This". It reserves the gift.
  - **Release**: give a claim back.
  - **Taken**: a number someone else has claimed.
  - **Personal link**: a member's private sign-in link.
- Never hard-code "family" in text users read. Get the group word, invite text and examples from the shared group-wording helper, using the group's type. With no group yet, say "group". The PRD's Group wording table is the source.
- Never write copy that hints at who claimed something or what was claimed, except to the claimer.
- Button labels follow the PRD: "Pick a Gift", "I'll Buy This", "Try Another Number", "Mark Purchased", "Release". Where a mockup's wording differs, the PRD wins.
