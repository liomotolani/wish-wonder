# Test data

The reference family for privacy and claim tests is the Williams family.

| Member | Role | Notes |
| --- | --- | --- |
| Mum | Organiser | Also manages Baby Leo's list |
| Dad | Member | |
| Sarah | Member | Wish list used for picker and claim tests |
| Grandma | Member | |
| James | Member | Buyer in the reference flows |
| Baby Leo | Member | Managed by Mum, no phone |

Event: **Christmas 2026**.

## How the automated tests get their data

`tests/family-fixture.ts` creates an isolated copy of the Williams-shaped family for each test:

- A unique family name and invite code, so tests never touch each other or any seeded data.
- Mum as organiser, then Dad, Sarah and James joining with invite codes.
- Sarah owns the gifts used by the picker and claim tests.
- Every test cleans up its family afterwards. Deleting the family cascades to its members, sessions, gifts, claims, notices and picker visits.

No personal links are committed. Each test creates a fresh personal token, stores only its SHA-256 hash, and discards the raw value when the family is removed.

## Manual seed

`supabase/seed.sql` is intentionally empty. Run `supabase db reset` for a clean database, then create a family through the welcome screen so that the organiser gets a real personal link. This keeps development personal links out of the repository.
