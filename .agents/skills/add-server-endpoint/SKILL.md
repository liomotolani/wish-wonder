---
name: add-server-endpoint
description: Use when adding or changing a route handler in app/api/ or a Server Action that reads or writes family data.
---

# Add a server endpoint or action

1. Pick the shape:
   - Server Action for a form or button on one page (save gift, mark purchased).
   - Route handler in `app/api/` for anything called from several places or polled (picker, reveal, claim).
2. Define the input schema and the response type first, in `lib/types.ts` or next to the handler. Name the response for who receives it, for example `OwnerGiftView`, `RevealResult`, `ClaimResult`.
3. Write or reuse the data function in `lib/db/`. The handler should only:
   1. resolve the current member from their session
   2. validate input
   3. call the `lib/db/` function
   4. map the result to the response type
4. Return expected outcomes as typed results, not thrown errors, for example `{ ok: false, reason: 'not_found' }` or `'not_allowed'`. Reuse existing reasons before adding new ones.
5. Add the endpoint to the API table in the PRD if it's new.
6. Write tests with `test-claims-and-secrecy`.
7. Call it from the UI and check the happy path and one failure path in the browser.
