import { sendJson } from './_lib/request.js';

export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  const payload = {
    ok: true,
    timestamp: new Date().toISOString(),
  };

  if (process.env.VERCEL_ENV !== 'production') {
    payload.config = {
      siteUrl: Boolean(process.env.SITE_URL),
      supabasePublic: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      supabaseServer: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      turnstile: Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY),
      sentry: Boolean(process.env.SENTRY_DSN),
    };
  }

  sendJson(response, 200, payload);
}
