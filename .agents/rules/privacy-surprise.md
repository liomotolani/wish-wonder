---
trigger: always_on
description: "How to keep claims hidden from recipients in every layer of the code"
---

# Privacy and surprise

The surprise is the product. Treat a leaked claim as a security bug.

- Queries that serve a member's own wish list never select claim columns or join the `claims` table.
- API responses use explicit response types (DTOs). Never return a database row as-is.
- In Boxes view, a box carries only its number, price and state, and a reveal returns exactly one gift. Never send the number-to-gift mapping to the browser.
- The full list (List view, FR-21c) goes only to a buyer who is not the recipient, and only marks each gift Taken or not. Never include who claimed it. Respect the group's mystery-boxes setting (FR-46) on the server.
- A Taken box carries only its number and `taken: true`. No gift name, price or buyer. In List view a Taken gift shows its details but never its buyer.
- Only the claimer can read their claims. The organiser has no special access to claims.
- Hiding data with CSS or client-side filtering does not count. If the browser receives it, it has leaked.
- Every new or changed endpoint gets a test that asserts what the response does and does not contain, including from the recipient's point of view.
- Notices to buyers (deleted gift, removed member) show only the gift name and the owner's name, and only to the affected buyer.
