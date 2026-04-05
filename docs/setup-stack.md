# pet-namer setup memo

This project is currently a static site deployed on Vercel.

## What is already confirmed

- Git is installed locally.
- Global Git identity is set.
- The repository already has a GitHub remote.
- `.vercel/project.json` exists, so this directory has been linked to Vercel before.

## Recommended stack for this project

- Hosting: Vercel
- Database: Supabase
- Auth: Supabase Auth
- Bot protection: Cloudflare Turnstile
- Monitoring: Sentry Browser SDK

## 1. Git basics

Keep the repo private until you are comfortable sharing code publicly.

Typical flow:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin main
```

This repo now ignores `.env` files so secrets are less likely to be committed by mistake.

## 2. Cursor pricing

Cursor has a free Hobby plan and paid plans above it. Check the latest official prices here:

- https://cursor.com/pricing

## 3. Vercel CLI

If you want the CLI available without a global install, run it with `npx`.

```bash
npx vercel --version
npx vercel login
npx vercel whoami
```

Because this repo is already linked, these are the most useful follow-up commands:

```bash
npx vercel pull --yes
npx vercel --prod
```

## 4. Supabase setup

1. Create a new Supabase project in the dashboard.
2. Copy the project URL and anon key into `.env.local`.
3. Add the same values to Vercel environment variables.
4. The site reads safe public values from `/api/public-config`, so the login panel on the top page becomes active after deployment.

Suggested local file:

```bash
cp .env.example .env.local
```

Suggested variables to fill:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

For this static site, start with these Supabase features:

- Auth if you add saved favorites, user accounts, or admin pages
- Postgres if you add forms, submissions, or dynamic content
- Storage only if you later upload files or images from users

## 5. Auth

For this project, Supabase Auth is the simplest option because it stays close to the database.

Good first auth methods:

- Magic link
- Email and password

Do not put the service role key in browser JavaScript.

## 6. Security

Security headers were added in `vercel.json`.

If you add a contact form, also set up Cloudflare Turnstile:

1. Create a Turnstile site.
2. Put the public site key in the frontend.
3. Keep the secret key only in Vercel env vars.
4. Verify the token in a server-side endpoint before accepting submissions.

## 7. Monitoring

Use Sentry when you want browser-side error tracking.

Minimal plan:

1. Create a Sentry project for JavaScript.
2. Put `SENTRY_DSN` into Vercel and `.env.local`.
3. The top page now initializes Sentry automatically when `SENTRY_DSN` is present.

## 8. Suggested order from here

1. Keep GitHub private.
2. Fill `.env.local`.
3. Log in to Vercel CLI.
4. Create the Supabase project.
5. Add Turnstile only when you add a form.
6. Add Sentry when the site starts getting traffic.
