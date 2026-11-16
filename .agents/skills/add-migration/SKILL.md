---
name: add-migration
description: Use when the database schema needs a new table, column, index, constraint or row level security policy.
---

# Add a database migration

1. Check the PRD's data model table. If the change isn't there, flag it so the PRD can be updated alongside the code.
2. Create the file:
   ```bash
   supabase migration new <short_snake_case_name>
   ```
   Examples: `add_notices_table`, `add_one_active_claim_index`.
3. Write the SQL in the new file. Include, where relevant:
   - whatever the supabase-data-access rule requires of a new table
   - foreign keys with the delete behaviour the PRD describes
   - indexes for columns you filter on (`family_id`, `event_id`, `gift_id`)
4. Apply it locally from a clean database, which also re-runs the seed:
   ```bash
   supabase db reset
   ```
5. Regenerate the TypeScript types:
   ```bash
   supabase gen types typescript --local > lib/database.types.ts
   ```
6. Fix any type errors in `lib/db/` that the new types reveal.
7. Update `supabase/seed.sql` if it no longer fits the schema, keeping it in line with `docs/test-data.md`.
8. In your summary, name the migration file and say whether it changes existing data.
