# Deployment checklist

## 1. Required environment variables

Set these in Vercel for both Preview and Production.

- `SITE_URL`
- `PUBLIC_SITE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `SENTRY_DSN`

## 2. Supabase

1. Log in with `npx supabase login`
2. Create a Supabase project in the dashboard
3. Apply the SQL in `supabase/migrations`
4. Enable Email auth in Supabase Auth
5. Add these redirect URLs
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `https://sippomi.com`
   - `https://www.sippomi.com`
   - `https://pet-namer.vercel.app` (旧 Preview / 旧プロジェクトを残す場合のみ)

## 3. Vercel

Use the linked project in this repo.

```bash
npx vercel env add
npx vercel --prod
```

Current check:

```bash
npx vercel env ls
```

## 4. Verification

After deploy, verify the pages and API routes:

```bash
npm run verify:deployment -- https://pet-namer.vercel.app
npm run verify:deployment -- https://sippomi.com
```

The script checks:

- `/`
- `/dog-names`
- `/cat-names`
- `/rabbit-names`
- `/api/public-config`
- `/api/health`

## 5. Manual smoke test

1. Open the top page
2. Run a diagnosis
3. Expand the auth panel
4. Sign up or sign in
5. Solve Turnstile if enabled
6. Save a favorite name
7. Confirm it appears in the saved favorites section
8. Reload and confirm it stays saved
