---
trigger: model_decision
description: "Use when writing or changing code for invite links, personal links, joining, sessions or member identity"
---

# Personal links and identity

- There are no accounts or passwords. Don't add Supabase Auth, OAuth or email sign-in.
- The invite link lets someone join a family. It never signs anyone in.
- A personal link token is at least 32 random bytes from a cryptographically secure generator, encoded URL-safe.
- Store only a hash of the token (SHA-256) in `member_sessions`. Never store the raw token.
- After the first visit, move the token into a cookie that is `httpOnly`, `secure` and `SameSite=Lax`, then redirect to a URL without the token.
- Opening the personal link on another device is allowed and signs it in too. A device link creates a new `member_sessions` row with its own token. Signing in on one device never signs out another.
- Reissuing a member's link revokes all of that member's sessions, on every device, then creates one new personal link.
- A device link (FR-4a) is single-use and expires 15 minutes after creation. Store only its hash in `device_links`. Using it creates a new session and marks the link used in one transaction, so it can't be used twice.
- Only a signed-in, active member can create a device link, and only for themselves.
- A device can hold sessions for several groups at once (FR-1b). Creating, joining, or opening a personal or device link adds that group's session and never removes another group's. Removing a group from a device deletes only that group's session on that device.
- Every request acts on exactly one active group, chosen by the switcher. Never mix data from two groups in one response.
- The personal link is shown once. Don't store the raw token to make it showable again.
- Never log tokens, put them in error messages, or send them to analytics.
- Look a member up by the hash of the presented token. Never compare or query raw tokens.
- An unknown or revoked token shows the "This link no longer works" screen, never a technical error.
