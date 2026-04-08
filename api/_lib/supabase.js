import { createClient } from '@supabase/supabase-js';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function createSupabaseAdmin() {
  const supabaseUrl = requiredEnv('SUPABASE_URL');
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function requireAuthenticatedUser(accessToken) {
  if (!accessToken) {
    return { error: 'Missing bearer token', user: null, supabase: null };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return { error: error?.message || 'Invalid access token', user: null, supabase };
    }
    return { error: null, user: data.user, supabase };
  } catch (error) {
    return { error: error.message || 'Supabase auth failed', user: null, supabase: null };
  }
}
