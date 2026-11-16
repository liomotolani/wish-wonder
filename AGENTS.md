# AGENTS.md

## Project
Wish & Wonder is a family Christmas wish list web app with no accounts. Members add wishes. Buyers open shuffled, numbered mystery boxes to reveal gifts, then secretly claim one. Mobile-first, responsive up to laptop. British English, prices in £.

## Source of truth
- `docs/PRD.md`: requirements (FR-x IDs) and decisions. The PRD wins; flag any conflict before coding.
- `docs/mockups/`: exported phone and laptop screens.

## Stack
Next.js, React, Tailwind CSS, Supabase Postgres, Vercel.

## Planned layout (create if missing)
- `app/`: pages and server routes
- `lib/`: data access and domain logic
- `supabase/migrations/`: schema changes
- `tests/`

## Commands
- `npm run dev` and `supabase start`: run locally
- `npm run lint` and `npm test`: must pass before a task is done

## Never break
1. No logins or passwords. A member's identity is their secret personal link. Never log or expose it.
2. A recipient's browser never receives claim data, not even hidden.
3. Claims are checked on the server, with one active claim per gift.
4. The Supabase service key is used only on the server.

## Elsewhere
- `.agents/rules/`: coding conventions
- `.agents/skills/`: step-by-step workflows

Keep this file short.
