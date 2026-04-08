import { z } from 'zod';
import { readBearerToken, readJsonBody, sendJson } from './_lib/request.js';
import { requireAuthenticatedUser } from './_lib/supabase.js';
import { verifyTurnstileToken } from './_lib/turnstile.js';

const favoritePayloadSchema = z.object({
  name: z.string().min(1).max(80),
  reading: z.string().max(120).optional().nullable(),
  meaning: z.string().max(500).optional().nullable(),
  species: z.array(z.string().min(1).max(40)).min(1).max(8),
  gender: z.string().max(40).optional().nullable(),
  vibe: z.array(z.string().min(1).max(40)).max(20).optional().default([]),
  color: z.array(z.string().min(1).max(40)).max(20).optional().default([]),
  matchScore: z.number().int().min(0).max(100).optional().nullable(),
  matchLabel: z.string().max(40).optional().nullable(),
  savedFromPath: z.string().max(200).optional().nullable(),
});

function withNoStore(response) {
  response.setHeader('Cache-Control', 'no-store');
}

function mapFavoriteRow(row) {
  return {
    id: row.id,
    name: row.name,
    reading: row.reading || '',
    meaning: row.meaning,
    species: row.species || [],
    gender: row.gender,
    vibe: row.vibe || [],
    color: row.color || [],
    match: row.match_score == null && row.match_label == null
      ? null
      : {
          score: row.match_score,
          label: row.match_label,
        },
    createdAt: row.created_at,
  };
}

export default async function handler(request, response) {
  withNoStore(response);

  if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, DELETE');
    return sendJson(response, 405, { ok: false, error: 'Method not allowed' });
  }

  const accessToken = readBearerToken(request);
  const { error: authError, user, supabase } = await requireAuthenticatedUser(accessToken);
  if (authError || !user || !supabase) {
    return sendJson(response, 401, { ok: false, error: authError || 'Unauthorized' });
  }

  try {
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('favorite_names')
        .select('id, name, reading, meaning, species, gender, vibe, color, match_score, match_label, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      return sendJson(response, 200, {
        ok: true,
        favorites: (data || []).map(mapFavoriteRow),
      });
    }

    const body = await readJsonBody(request);

    if (request.method === 'POST') {
      const parsed = favoritePayloadSchema.safeParse(body.favorite || {});
      if (!parsed.success) {
        return sendJson(response, 400, { ok: false, error: 'Invalid favorite payload' });
      }

      const verification = await verifyTurnstileToken(
        body.turnstileToken,
        request.headers['x-forwarded-for'],
      );

      if (!verification.success) {
        return sendJson(response, 400, {
          ok: false,
          error: 'Turnstile verification failed',
          detail: verification.code || null,
        });
      }

      const favorite = parsed.data;
      const { data, error } = await supabase
        .from('favorite_names')
        .upsert({
          user_id: user.id,
          name: favorite.name,
          reading: favorite.reading || '',
          meaning: favorite.meaning || null,
          species: favorite.species,
          gender: favorite.gender || null,
          vibe: favorite.vibe || [],
          color: favorite.color || [],
          match_score: favorite.matchScore ?? null,
          match_label: favorite.matchLabel ?? null,
          saved_from_path: favorite.savedFromPath || null,
        }, {
          onConflict: 'user_id,name,reading',
          ignoreDuplicates: false,
        })
        .select('id, name, reading, meaning, species, gender, vibe, color, match_score, match_label, created_at')
        .single();

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      return sendJson(response, 200, {
        ok: true,
        favorite: mapFavoriteRow(data),
      });
    }

    const favoriteId = typeof body.id === 'string' ? body.id : '';
    if (!favoriteId) {
      return sendJson(response, 400, { ok: false, error: 'Missing favorite id' });
    }

    const { error } = await supabase
      .from('favorite_names')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', user.id);

    if (error) {
      return sendJson(response, 500, { ok: false, error: error.message });
    }

    return sendJson(response, 200, { ok: true, id: favoriteId });
  } catch (error) {
    return sendJson(response, 500, { ok: false, error: error.message || 'Unknown server error' });
  }
}
