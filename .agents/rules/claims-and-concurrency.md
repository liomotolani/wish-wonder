---
trigger: model_decision
description: "Use when writing or changing code that reveals, claims, releases or purchases gifts, or the mystery picker"
---

# Claims and concurrency

- Claiming runs in one database transaction on the server. Never check availability in one request and insert in another.
- The partial unique index `one_active_claim_per_gift` (on `gift_id` where status is `reserved` or `purchased`) is the final guard. Don't remove or weaken it.
- When the insert hits that unique violation, return a typed "already picked" result. The UI shows "Already picked" and turns the box Taken. Never return a 500 for this case.
- Reject a claim when the claimer owns the gift. Whether someone who manages a list (such as a child's) may claim from it is still open in the PRD: don't decide it, flag it.
- Store a snapshot of the gift's details on the claim, so later edits don't change the buyer's plan.
- Release sets status to `released`. Released claims are hidden from My Secret Gifts and the gift returns to the pool.
- There is no limit on claims per buyer or per recipient.
- The number-to-gift mapping is shuffled on the server for each picker visit and is never sent to the browser. Keep it on the server for the length of the visit (for example a `picker_visits` row holding a random seed), so reopening a Peeked number shows the same gift.
- Claim, release, reveal and delete changes need overlap tests (see the `test-claims-and-secrecy` skill).
