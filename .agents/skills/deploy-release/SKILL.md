---
name: deploy-release
description: Use when preparing to deploy to production on Vercel, or after a deploy to confirm it worked.
---

# Deploy a release

Before deploying:
1. Confirm the checks from AGENTS.md pass on the branch being released, plus a production build:
   ```bash
   npm run build
   ```
2. List the migrations not yet applied to production and read each one. Flag anything that deletes or rewrites existing data.
3. Compare the Vercel environment variables with `.env.example`: every variable is set for Production, and none breaks the supabase-data-access rule.
4. Apply migrations to the linked production project:
   ```bash
   supabase db push
   ```
5. Deploy through Vercel (merge to the production branch, or `vercel --prod`).

After deploying, smoke test on a phone with a throwaway family:
1. Create a family, then join it from a second browser.
2. Add a gift as one member, then reveal and claim it as the other.
3. Open the recipient's wish list and confirm nothing shows the claim.
4. Release the claim and confirm the number returns to the grid.
5. Delete the throwaway family.

If any step fails, roll back in Vercel to the previous deployment and report what failed.
