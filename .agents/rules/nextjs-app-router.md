---
trigger: glob
globs: "app/**"
description: "Next.js App Router conventions for pages, layouts and server routes"
---

# Next.js App Router

- Components are Server Components by default. Add `'use client'` only for interactivity: forms, the picker grid, animations, copy buttons.
- Keep client components small and as low in the tree as possible. Pass them plain props, never database rows.
- Load data in Server Components or server-only modules. Never fetch from Supabase directly in a client component.
- Mutations go through Server Actions or route handlers in `app/api/`. Check the member's identity and family on every call.
- Mark server-only modules with `import 'server-only'` so they can't be bundled for the browser.
- Put shared UI in `app/_components/` and page-specific UI next to the page.
- Every page that loads data has a `loading.tsx`, and every route segment that can fail has an `error.tsx` with friendly copy.
- Set `Referrer-Policy: no-referrer` for all routes.
- Don't use `localStorage` for anything that identifies a member.
