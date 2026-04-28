import { z } from 'zod';
import { readBearerToken, readJsonBody, sendJson } from './_lib/request.js';
import { getOrCreateProfile, profileToClient } from './_lib/community.js';
import { requireAuthenticatedUser } from './_lib/supabase.js';

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  username: z.string().trim().min(3).max(24).regex(/^[a-z0-9_]+$/i),
  bio: z.string().trim().max(240).optional().nullable(),
  petName: z.string().trim().min(1).max(60),
  petSpecies: z.string().trim().min(1).max(40),
  isPetOwner: z.boolean(),
});

function withNoStore(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

export default async function handler(request, response) {
  withNoStore(response);

  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return sendJson(response, 405, { ok: false, error: 'Method not allowed' });
  }

  const accessToken = readBearerToken(request);
  const { error: authError, user, supabase } = await requireAuthenticatedUser(accessToken);
  if (authError || !user || !supabase) {
    return sendJson(response, 401, { ok: false, error: authError || 'Unauthorized' });
  }

  try {
    if (request.method === 'GET') {
      const profile = await getOrCreateProfile(supabase, user);
      return sendJson(response, 200, { ok: true, profile: profileToClient(profile) });
    }

    const body = await readJsonBody(request, { maxBytes: 64 * 1024 });
    const parsed = profileSchema.safeParse(body.profile || {});
    if (!parsed.success) {
      return sendJson(response, 400, { ok: false, error: 'Invalid profile payload' });
    }

    const payload = parsed.data;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || null,
        display_name: payload.displayName,
        username: payload.username.toLowerCase(),
        bio: payload.bio || null,
        pet_name: payload.petName,
        pet_species: payload.petSpecies,
        is_pet_owner: payload.isPetOwner,
      }, { onConflict: 'id' })
      .select('id, email, display_name, username, bio, pet_name, pet_species, avatar_url, is_pet_owner')
      .single();

    if (error) {
      if (/profiles_username_unique/i.test(error.message || '')) {
        return sendJson(response, 409, { ok: false, error: 'そのユーザー名はすでに使われています' });
      }
      return sendJson(response, 500, { ok: false, error: error.message });
    }

    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        display_name: payload.displayName,
        username: payload.username.toLowerCase(),
        pet_name: payload.petName,
        pet_species: payload.petSpecies,
      },
    });

    return sendJson(response, 200, { ok: true, profile: profileToClient(data) });
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return sendJson(response, statusCode, {
      ok: false,
      error: error.message || 'Unknown server error',
    });
  }
}
