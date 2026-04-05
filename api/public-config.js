module.exports = (request, response) => {
  response.setHeader('Cache-Control', 'no-store');

  response.status(200).json({
    siteUrl: process.env.SITE_URL || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    sentryDsn: process.env.SENTRY_DSN || '',
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
    hasSupabaseAuth: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    hasSentry: Boolean(process.env.SENTRY_DSN),
  });
};
