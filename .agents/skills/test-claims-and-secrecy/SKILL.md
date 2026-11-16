---
name: test-claims-and-secrecy
description: Use when writing tests for any endpoint, Server Action or data loader that touches gifts or claims. Proves each member sees only what they should, and that overlapping actions stay correct.
---

# Test claims and secrecy

Use the Williams family from `docs/test-data.md`. Run against the local database: mocks can't reproduce a race.

## Who sees what
1. Call the endpoint as the recipient (Sarah), the claimer (James) and another member (Dad). Assert on the raw JSON, not on what a component renders.
2. Recipient: no claim fields on her own gifts. Other member: Taken numbers only. Claimer: their own claims only.
3. Walk the whole response and fail if these keys appear where they don't belong: `claim`, `claimer`, `claimerMemberId`, `status`, `snapshot`, `token`.
4. Repeat the recipient case for Mum viewing her own list and Baby Leo's list.

## Overlapping actions
5. Two claims on one gift with `Promise.all`: exactly one succeeds, one database row is active.
6. Claim, release, then claim as someone else: the second claim succeeds.
7. Delete a claimed gift, and remove a member who has gifts and claims: the claims are gone, the gifts are back in the pool, and the affected buyers have notices.
8. Reveal the same number twice in one visit: the same gift comes back.
9. Claim your own gift: `not_allowed`.
10. Run the race tests several times in a row before trusting them.
