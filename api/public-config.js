import { sendJson } from './_lib/request.js';

export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');

  sendJson(response, 200, {
    siteUrl: process.env.SITE_URL || '',
    publicSiteUrl: process.env.PUBLIC_SITE_URL || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    sentryDsn: process.env.SENTRY_DSN || '',
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
    hasSupabaseAuth: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    hasSentry: Boolean(process.env.SENTRY_DSN),
    hasTurnstile: Boolean(process.env.TURNSTILE_SITE_KEY),
  });
}
