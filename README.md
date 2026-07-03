# FX Unlock — Risk Calculator

Standalone risk / position-size calculator extracted from the FX Unlock Trade
Journal, sharing the same Lumina design system (forest green + electric lime,
Manrope + Hanken Grotesk).

## Stack

- **Next.js 16** (App Router, static export — `output: "export"`)
- **Tailwind CSS 4** + shadcn (Base UI primitives)
- **Supabase** — email/password auth + saved calculations (RLS-protected)

Everything runs client-side, so the exported site works on any static host
(GitHub Pages, Vercel, Netlify…).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

## Database

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
It creates:

- `public.profiles` — auto-populated on signup via trigger
- `public.risk_calculations` — per-user saved calculations
- Row Level Security policies so users only ever see their own rows

Make sure the **Email** auth provider is enabled
(Authentication → Sign In / Up → Email).

## Deployment

### GitHub Pages

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which builds
with `NEXT_PUBLIC_BASE_PATH=/Risk-Calculator` and publishes the `out/` folder
to GitHub Pages.

### Vercel

Import the repo in Vercel and set the environment variables:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | project anon key |

Leave `NEXT_PUBLIC_BASE_PATH` unset — Vercel serves from the domain root.
