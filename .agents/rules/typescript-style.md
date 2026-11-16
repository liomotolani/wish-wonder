---
trigger: always_on
description: "Core TypeScript conventions for this repo"
---

# TypeScript style

- `strict` mode is on. No `any`; use `unknown` and narrow it.
- No non-null assertions (`!`) unless a comment explains why the value can't be null.
- Names: `camelCase` for variables and functions, `PascalCase` for types and components, `SCREAMING_SNAKE_CASE` for constants. Files use `kebab-case`, except React components (`PascalCase.tsx`) and Next.js special files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- Shared domain types (`Family`, `GiftEvent`, `Member`, `Gift`, `Claim`, `ClaimStatus`, `Notice`). Don't name a type `Event`: it clashes with the browser's built-in `Event`. live in `lib/types.ts`. Don't redefine them per file.
- Keep functions small and single-purpose. Prefer early returns over nested `if` blocks.
- Validate all external input (forms, route params, request bodies) with a schema at the boundary. Use Zod.
- Model fixed sets of values as string literal unions, not free strings, for example `ClaimStatus = 'reserved' | 'purchased' | 'released'`.
- Money is an integer number of pence everywhere. Format it only when displaying.
- No commented-out code and no unused exports.
