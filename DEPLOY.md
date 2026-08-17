# Deployment

## Supabase — done
Project **Boise-Demo** (`zdqspipxlnexsmfilwae`, us-west-2). Migrations in
`supabase/migrations/` are the source of truth and are already applied.
Security advisors return no findings.

Auth: passwordless email magic link. Enable the Email provider in
Supabase → Authentication → Providers, and add the Vercel production URL under
Authentication → URL Configuration → Redirect URLs.

## Vercel — not run from this environment
`api.vercel.com` is blocked by this sandbox's network policy (the proxy answers
403 to CONNECT), so the CLI cannot reach Vercel from here. Run locally:

```bash
npm i -g vercel
vercel login                      # opens a browser
vercel link --project boise-westfield-command-center
vercel env add VITE_SUPABASE_URL              # paste the value; repeat for preview + production
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY  # same
vercel --prod
```

Framework preset **Vite**, build `npm run build`, output `dist`.
`vercel.json` already handles SPA rewrites. Values for both variables are in
your local `.env` (gitignored) and in the Supabase dashboard under
Project Settings → API.

After the first deploy, turn on Deployment Protection for Preview deployments
(Vercel → Project → Settings → Deployment Protection) if your plan includes it.
