# Deployment

## Status

| Piece | State |
| --- | --- |
| Supabase project **Boise-Demo** (`zdqspipxlnexsmfilwae`) | Live. Migrations applied, RLS on, security advisors clean. |
| Production build | Passing. Validated served, including SPA deep links. |
| Behaviour without env vars | Validated. Shows the local-storage fallback, no blank screen. |
| Vercel | **Not deployed.** Blocked by network policy in the build environment, not by credentials. |
| Exports | Working in both a normal browser and a sandboxed viewer. |

`api.vercel.com` and `vercel.com` are both refused at this environment's egress
proxy (403 on CONNECT). The refusal happens before any request is sent, so an
access token cannot authenticate through it. Deployment has to run somewhere
with normal outbound access.

## Fastest route — Vercel dashboard, no terminal

The repository is already on GitHub, so nothing needs to be uploaded.

1. <https://vercel.com/new> → **Import Git Repository** → `nolanmarcouxllc/Boise-Demo`.
2. Project name: `boise-westfield-command-center`.
3. Framework preset **Vite** (auto-detected). Build `npm run build`, output `dist`.
4. Add two Environment Variables for Production, Preview and Development:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

   Both values are in your local `.env` (gitignored), and in the Supabase
   dashboard under Project Settings → API. The publishable key is browser-safe
   by design; every table is protected by row-level security.
5. Deploy.

No branch configuration is needed. `claude/boise-cascade-command-center-r4mwov`
is the repository's default branch on GitHub, so Vercel adopts it as the
production branch on import and every later push to it redeploys.

## CLI route, if you prefer

```bash
npm i -g vercel
vercel login
vercel link --project boise-westfield-command-center
vercel env add VITE_SUPABASE_URL production      # repeat: preview, development
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
vercel --prod
```

## After the first deploy

- **Supabase → Authentication → Providers**: enable **Email**.
- **Supabase → Authentication → URL Configuration → Redirect URLs**: add the
  Vercel production URL. Magic-link sign-in fails until this is set.
- **Vercel → Settings → Deployment Protection**: enable for Preview deployments
  if your plan includes it. Production stays reachable for the meeting either way.

`vercel.json` already handles SPA rewrites and `noindex, nofollow` is in the
built HTML.
