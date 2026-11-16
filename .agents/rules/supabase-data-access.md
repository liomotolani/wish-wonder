---
trigger: glob
globs: "lib/**, supabase/**"
description: "How code reads and writes the Supabase database"
---

# Supabase data access

- All database access goes through functions in `lib/db/`. Pages and routes call those functions, never Supabase directly.
- The service key is read only in server-only modules. It must never appear in a file that a client component imports, or in any `NEXT_PUBLIC_` variable.
- Every query is scoped to the current member's family (and event). Never trust a `familyId` sent by the browser.
- Row level security is enabled on every table as a backstop, with no policies that allow direct browser access to `claims`. The service key bypasses row level security, so the family scoping in `lib/db/` is the real guard. Test it.
- Schema changes go in a new file in `supabase/migrations/`. Each migration does one thing and has a clear name.
- Use the Supabase client's query builder or parameterised SQL. Never build SQL by joining strings.
- Deleting a gift deletes its active claims in the same transaction. Deleting a member deletes their gifts, their claims and the claims on their gifts. In both cases, first write a row to `notices` for each affected buyer, in the same transaction, so they can be told.
- Store money as integer pence and timestamps as `timestamptz`.
