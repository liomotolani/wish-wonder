---
trigger: always_on
description: "How to keep claims hidden from recipients in every layer of the code"
---

# Privacy and surprise

The surprise is the product. Treat a leaked claim as a security bug.

- Queries that serve a member's own wish list never select claim columns or join the `claims` table.
- API responses use explicit response types (DTOs). Never return a database row as-is.
- A reveal returns exactly one gift. Never send the full list, or the number-to-gift mapping, to the browser.
- A Taken box carries only its number and `taken: true`. No gift name, price or buyer. Showing how many gifts are Taken is intended; showing which ones is not.
- Only the claimer can read their claims. The organiser has no special access to claims.
- Hiding data with CSS or client-side filtering does not count. If the browser receives it, it has leaked.
- Every new or changed endpoint gets a test that asserts what the response does and does not contain, including from the recipient's point of view.
- Notices to buyers (deleted gift, removed member) show only the gift name and the owner's name, and only to the affected buyer.
