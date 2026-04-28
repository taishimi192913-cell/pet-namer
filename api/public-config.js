import { sendJson } from './_lib/request.js';

function env(name) {
  return (process.env[name] || '').trim();
}

export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  const siteUrl = env('SITE_URL');
  const publicSiteUrl = env('PUBLIC_SITE_URL');
  const supabaseUrl = env('SUPABASE_URL');
  const supabaseAnonKey = env('SUPABASE_ANON_KEY');
  const sentryDsn = env('SENTRY_DSN');
  const turnstileSiteKey = env('TURNSTILE_SITE_KEY');

  sendJson(response, 200, {
    siteUrl,
    publicSiteUrl,
    supabaseUrl,
    supabaseAnonKey,
    sentryDsn,
    turnstileSiteKey,
    hasSupabaseAuth: Boolean(supabaseUrl && supabaseAnonKey),
    hasSentry: Boolean(sentryDsn),
    hasTurnstile: Boolean(turnstileSiteKey),
  });
}
