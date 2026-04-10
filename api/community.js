import { z } from 'zod';
import { readBearerToken, readJsonBody, sendJson } from './_lib/request.js';
import { requireAuthenticatedUser } from './_lib/supabase.js';

const communityPostSchema = z.object({
  authorName: z.string().trim().min(1).max(60).optional().nullable(),
  petName: z.string().trim().max(60).optional().nullable(),
  petSpecies: z.string().trim().max(40).optional().nullable(),
  topic: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(800),
});

function withNoStore(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

function fallbackAuthorName(user) {
  if (typeof user?.user_metadata?.display_name === 'string' && user.user_metadata.display_name.trim()) {
    return user.user_metadata.display_name.trim().slice(0, 60);
  }
  if (typeof user?.email === 'string' && user.email.includes('@')) {
    return user.email.split('@')[0].slice(0, 60);
  }
  return 'シッポミ member';
}

function mapPostRow(row, viewerId) {
  return {
    id: row.id,
    authorName: row.author_name,
    petName: row.pet_name || '',
    petSpecies: row.pet_species || '',
    topic: row.topic,
    body: row.body,
    createdAt: row.created_at,
    isOwner: row.user_id === viewerId,
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
        .from('owner_community_posts')
        .select('id, user_id, author_name, pet_name, pet_species, topic, body, created_at')
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      return sendJson(response, 200, {
        ok: true,
        posts: (data || []).map((row) => mapPostRow(row, user.id)),
      });
    }

    const body = await readJsonBody(request, { maxBytes: 32 * 1024 });

    if (request.method === 'POST') {
      const parsed = communityPostSchema.safeParse(body.post || {});
      if (!parsed.success) {
        return sendJson(response, 400, { ok: false, error: 'Invalid community post payload' });
      }

      const post = parsed.data;
      const { data, error } = await supabase
        .from('owner_community_posts')
        .insert({
          user_id: user.id,
          author_name: post.authorName || fallbackAuthorName(user),
          pet_name: post.petName || null,
          pet_species: post.petSpecies || null,
          topic: post.topic,
          body: post.body,
        })
        .select('id, user_id, author_name, pet_name, pet_species, topic, body, created_at')
        .single();

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }

      return sendJson(response, 200, {
        ok: true,
        post: mapPostRow(data, user.id),
      });
    }

    const postId = typeof body.id === 'string' ? body.id : '';
    if (!postId) {
      return sendJson(response, 400, { ok: false, error: 'Missing post id' });
    }

    const { error } = await supabase
      .from('owner_community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) {
      return sendJson(response, 500, { ok: false, error: error.message });
    }

    return sendJson(response, 200, { ok: true, id: postId });
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return sendJson(response, statusCode, {
      ok: false,
      error: error.message || 'Unknown server error',
    });
  }
}
