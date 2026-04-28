import { z } from 'zod';
import { requireCommunityMember } from './_lib/community.js';
import { readBearerToken, readJsonBody, sendJson } from './_lib/request.js';
import { requireAuthenticatedUser } from './_lib/supabase.js';
import { verifyWriteChallenge } from './_lib/write-protection.js';

const payloadSchema = z.object({
  postId: z.string().uuid(),
});

function withNoStore(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

async function getLikeSummary(supabase, postId, userId) {
  const { data, error } = await supabase
    .from('community_post_likes')
    .select('user_id')
    .eq('post_id', postId);

  if (error) throw new Error(error.message);
  const likes = data || [];
  return {
    postId,
    likeCount: likes.length,
    likedByViewer: likes.some((entry) => entry.user_id === userId),
  };
}

export default async function handler(request, response) {
  withNoStore(response);

  if (!['POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'POST, DELETE');
    return sendJson(response, 405, { ok: false, error: 'Method not allowed' });
  }

  const accessToken = readBearerToken(request);
  const { error: authError, user, supabase } = await requireAuthenticatedUser(accessToken);
  if (authError || !user || !supabase) {
    return sendJson(response, 401, { ok: false, error: authError || 'Unauthorized' });
  }

  try {
    await requireCommunityMember(supabase, user);
    const body = await readJsonBody(request, { maxBytes: 32 * 1024 });
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return sendJson(response, 400, { ok: false, error: 'Invalid like payload' });
    }

    if (request.method === 'POST') {
      await verifyWriteChallenge(request, body);
      const { error } = await supabase
        .from('community_post_likes')
        .upsert({
          post_id: parsed.data.postId,
          user_id: user.id,
        }, { onConflict: 'post_id,user_id' });

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }
    } else {
      const { error } = await supabase
        .from('community_post_likes')
        .delete()
        .eq('post_id', parsed.data.postId)
        .eq('user_id', user.id);

      if (error) {
        return sendJson(response, 500, { ok: false, error: error.message });
      }
    }

    return sendJson(response, 200, {
      ok: true,
      like: await getLikeSummary(supabase, parsed.data.postId, user.id),
    });
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return sendJson(response, statusCode, {
      ok: false,
      error: error.message || 'Unknown server error',
    });
  }
}
