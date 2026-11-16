---
trigger: always_on
description: "Limits on the scope and shape of every change"
---

# Change discipline

- Do only what the task asks. Don't refactor, rename or reformat unrelated code.
- Keep each change small enough to review in one sitting. Split large tasks and say how you split them.
- Don't add a dependency without stating why and what it replaces. Prefer what the stack already provides.
- Never edit a migration that has already been applied. Write a new one.
- Never weaken a test to make it pass. Fix the code, or explain why the test is wrong.
- Don't disable lint rules, type checks or row level security to get something working.
- Never commit secrets, `.env` files or real personal links.
- If a requirement is unclear, make the smallest reasonable choice, then list it under "Assumptions" in your summary.
- When you finish, summarise what changed, which PRD requirement it covers (FR-x), and anything left undone.
